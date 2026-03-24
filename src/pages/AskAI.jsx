import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import ChatMessage from '../components/ChatMessage'
import DocumentPanel from '../components/DocumentPanel'
import { askQuestion, exportSummary, summarizeDoc, upsertChatSession, getChatSessions, deleteChatSession } from '../api'

// ── helpers ──────────────────────────────────────────────────────────────────
function makeSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function makeTitle(firstQuestion) {
  if (!firstQuestion) return 'New Chat'
  return firstQuestion.length > 48
    ? firstQuestion.slice(0, 48).trim() + '…'
    : firstQuestion
}

function timeAgo(iso) {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)  return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const findingColors = {
  positive: 'bg-emerald-500',
  neutral:  'bg-blue-500',
  warning:  'bg-amber-500',
  risk:     'bg-red-500',
}
const findingBg = {
  positive: 'bg-emerald-50 border-emerald-200/60',
  neutral:  'bg-blue-50   border-blue-200/60',
  warning:  'bg-amber-50  border-amber-200/60',
  risk:     'bg-red-50    border-red-200/60',
}
const findingFg = {
  positive: 'text-emerald-700',
  neutral:  'text-blue-700',
  warning:  'text-amber-700',
  risk:     'text-red-700',
}

const STEPS = ['Reading document…', 'Analyzing content…', 'Generating summary…', 'Building insights…']

// ── Component ────────────────────────────────────────────────────────────────
export default function AskAI() {
  // ── Session state ──
  const [sessions, setSessions]       = useState([])
  const [sessionId, setSessionId]     = useState(() => makeSessionId())
  const [messages, setMessages]       = useState([])
  const [activeDoc, setActiveDoc]     = useState(null)
  const [lastAiMsgId, setLastAiMsgId] = useState(null)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [summaryText, setSummaryText] = useState('')
  const [summaryFindings, setSummaryFindings] = useState([])
  const [summaryMeta, setSummaryMeta] = useState({ page_count: 0, word_count: 0, cached: false })
  const [summaryStep, setSummaryStep] = useState(0)
  const [copied, setCopied] = useState(false)
  const [summaryMinimized, setSummaryMinimized] = useState(false)

  // ── Chat state ──
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const messagesEndRef                = useRef(null)
  const currentActionIdRef            = useRef(0)
  const summaryStepTimerRef           = useRef(null)
  // ← Refs so the persist effect always sees the CURRENT sessionId / title
  //   even though it only runs when `messages` changes.
  const sessionIdRef                  = useRef(sessionId)
  const activeTitleRef                = useRef('New Chat')

  // Keep refs in sync with state
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])

  // ── UI state ──
  const [menuOpen, setMenuOpen]       = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [attachMenuOpen, setAttachMenuOpen] = useState(false)
  const menuRef                       = useRef(null)
  const historyRef                    = useRef(null)
  const attachMenuRef                 = useRef(null)

  const clearSummaryState = useCallback(() => {
    setSummaryText('')
    setSummaryFindings([])
    setSummaryMeta({ page_count: 0, word_count: 0, cached: false })
    setSummaryError('')
    setSummaryStep(0)
    setCopied(false)
    setSummaryMinimized(false)
  }, [])

  const loadSummaryResult = useCallback((data, cached = false) => {
    setSummaryText(data.summary || '')
    setSummaryFindings(data.findings || [])
    setSummaryMeta({
      page_count: data.page_count || 0,
      word_count: data.word_count || 0,
      cached,
    })
  }, [])

  const startSummaryStepTicker = useCallback(() => {
    setSummaryStep(0)
    let s = 0
    summaryStepTimerRef.current = setInterval(() => {
      s = Math.min(s + 1, STEPS.length - 1)
      setSummaryStep(s)
    }, 2200)
  }, [])

  const stopSummaryStepTicker = useCallback(() => {
    if (summaryStepTimerRef.current) {
      clearInterval(summaryStepTimerRef.current)
      summaryStepTimerRef.current = null
    }
  }, [])

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    return () => stopSummaryStepTicker()
  }, [stopSummaryStepTicker])

  // ── Load sessions from DB on mount ──
  useEffect(() => {
    setSessionsLoading(true)
    getChatSessions()
      .then((data) => {
        // Normalise: backend uses session_id / updated_at / created_at
        const normalised = data.map((s) => ({
          id:        s.session_id,
          title:     s.title,
          messages:  s.messages || [],
          activeDoc: s.active_doc
            ? (typeof s.active_doc === 'string' ? { filename: s.active_doc } : s.active_doc)
            : null,
          updatedAt: s.updated_at,
          createdAt: s.created_at,
        }))
        setSessions(normalised)
      })
      .catch((err) => console.warn('[Chat] Could not load sessions from DB:', err))
      .finally(() => setSessionsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist current session to DB whenever messages change (debounced) ──
  useEffect(() => {
    if (messages.length === 0) return
    const currId  = sessionIdRef.current          // always the LATEST sessionId
    const firstQ  = messages.find((m) => m.role === 'user')?.text || ''

    // Optimistic local update — read existing title from live state via setter
    setSessions((prev) => {
      const existing = prev.find((s) => s.id === currId)
      const title    = existing?.title || makeTitle(firstQ)
      activeTitleRef.current = title              // cache for DB write below
      const rest = prev.filter((s) => s.id !== currId)
      return [{
        id: currId, title, messages, activeDoc,
        updatedAt: new Date().toISOString(),
        createdAt: existing?.createdAt || new Date().toISOString(),
      }, ...rest].slice(0, 50)
    })

    // Debounce DB write 600 ms — captures currId so it never becomes stale
    const timer = setTimeout(() => {
      upsertChatSession({
        session_id: currId,
        title:      activeTitleRef.current,
        messages,
        active_doc: activeDoc?.filename || null,
      }).catch((err) => console.warn('[Chat] DB save failed:', err))
    }, 600)

    return () => clearTimeout(timer)
  }, [messages, activeDoc]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Close menus on outside click ──
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    if (menuOpen) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  useEffect(() => {
    const h = (e) => { if (historyRef.current && !historyRef.current.contains(e.target)) setHistoryOpen(false) }
    if (historyOpen) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [historyOpen])

  useEffect(() => {
    const h = (e) => { if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) setAttachMenuOpen(false) }
    if (attachMenuOpen) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [attachMenuOpen])

  // ── Send message ──
  const sendMessage = useCallback(async (question) => {
    if (!question?.trim()) return
    const actionId = Date.now()
    currentActionIdRef.current = actionId

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: question }])
    setInput('')
    setLoading(true)
    setError('')
    try {
      const scopedQuestion = activeDoc?.filename
        ? `About document "${activeDoc.filename}": ${question}`
        : question
      const data = await askQuestion(scopedQuestion)
      if (currentActionIdRef.current !== actionId) return // Abort if user edited or started new chat

      const rawSources = data.source_details
        ? data.source_details.map((s) => `${s.filename} · p.${s.page}`)
        : (data.sources || [])
      const sourceChips = rawSources.map((s) =>
        typeof s === 'object' ? `${s.filename} (score: ${s.score})` : s
      )
      const newAiId = Date.now() + 1
      setLastAiMsgId(newAiId)
      setMessages((prev) => [
        ...prev,
        { id: newAiId, role: 'ai', text: data.answer, sources: sourceChips, provider: data.provider || 'ai' },
      ])
    } catch (err) {
      if (currentActionIdRef.current !== actionId) return
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [activeDoc])

  const handleSend = () => sendMessage(input)

  const handleEditMessage = (id, text) => {
    currentActionIdRef.current = Date.now() // Invalidate pending requests
    const index = messages.findIndex(m => m.id === id)
    if (index !== -1) {
      setMessages(messages.slice(0, index))
      setInput(text)
      setLoading(false)
      setTimeout(() => document.getElementById('chat-input')?.focus(), 0)
    }
  }

  // ── New Chat ──
  const handleNewChat = () => {
    currentActionIdRef.current = Date.now() // Invalidate pending requests
    setSessionId(makeSessionId())
    setMessages([])
    setInput('')
    setError('')
    setActiveDoc(null)
    clearSummaryState()
    setMenuOpen(false)
    setHistoryOpen(false)
  }

  // ── Load a session from history ──
  const handleLoadSession = (sess) => {
    setSessionId(sess.id)
    setMessages(sess.messages || [])
    setActiveDoc(sess.activeDoc || null)
    setInput('')
    setError('')
    clearSummaryState()
    setHistoryOpen(false)
    setMenuOpen(false)
  }

  const handleClearSelectedDoc = () => {
    setActiveDoc(null)
    clearSummaryState()
  }

  const handlePreviewSelectedDoc = useCallback(() => {
    if (!activeDoc?.filename) return
    window.dispatchEvent(
      new CustomEvent('mutant:preview-document', {
        detail: {
          id: activeDoc?.id,
          filename: activeDoc.filename,
        },
      }),
    )
  }, [activeDoc])

  const handleSelectDocument = useCallback((doc) => {
    if (!doc) {
      setActiveDoc(null)
      clearSummaryState()
      return
    }

    setActiveDoc({ filename: doc.filename, id: doc.id, summary: doc.summary })
    clearSummaryState()

    if (doc.summary) {
      try {
        const cached = JSON.parse(doc.summary)
        if (cached?.summary) {
          loadSummaryResult(cached, true)
        }
      } catch {
        // ignore malformed cached summary
      }
    }
  }, [clearSummaryState, loadSummaryResult])

  const handleGenerateSummary = useCallback(async (force = false) => {
    if (!activeDoc?.filename) {
      setSummaryError('Select a document first from the right panel.')
      return
    }

    setSummaryLoading(true)
    setSummaryError('')
    startSummaryStepTicker()
    try {
      const data = await summarizeDoc(activeDoc.filename, force)
      if (!data || data.error || !data.summary) {
        throw new Error(data?.detail || 'Summary generation failed. Please try again.')
      }
      loadSummaryResult(data, !!data.cached)
    } catch (err) {
      setSummaryError(err.message)
    } finally {
      stopSummaryStepTicker()
      setSummaryLoading(false)
    }
  }, [activeDoc, loadSummaryResult, startSummaryStepTicker, stopSummaryStepTicker])

  const handleCopySummary = () => {
    if (!summaryText) return
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleExportSummary = () => {
    if (!activeDoc?.filename || !summaryText) return
    exportSummary(activeDoc.filename)
  }

  // ── Delete a session ──
  const handleDeleteSession = (e, sessId) => {
    e.stopPropagation()
    // Optimistic UI removal
    setSessions((prev) => prev.filter((s) => s.id !== sessId))
    // DB delete
    deleteChatSession(sessId).catch((err) => console.warn('[Chat] DB delete failed:', err))
    if (sessId === sessionId) handleNewChat()
  }

  // ── Starter suggestion chips ──
  const starters = activeDoc
    ? [
        `What are the key findings in "${activeDoc.filename}"?`,
        `List the main topics covered in "${activeDoc.filename}".`,
        `Are there action items in "${activeDoc.filename}"?`,
      ]
    : [
        'What documents have been uploaded?',
        'Summarize the most recent document.',
        'What are the key findings across all documents?',
      ]

  const hasSummary = !!summaryText
  const recommendedActions = useMemo(() => {
    if (summaryFindings.length >= 3) {
      return summaryFindings.slice(0, 3).map((f, idx) => ({
        priority: idx === 0 ? 'HIGH' : idx === 1 ? 'MED' : 'LOW',
        priorityColor: idx === 0 ? 'text-red-500' : idx === 1 ? 'text-amber-500' : 'text-emerald-600',
        title: `Finding ${idx + 1}`,
        text: f.text || String(f),
        type: f.type || 'neutral',
      }))
    }
    return [
      { priority: 'HIGH', priorityColor: 'text-red-500',     title: 'Review Key Risks',       text: 'Validate the highest-impact risks surfaced in this document.',                type: 'risk' },
      { priority: 'MED',  priorityColor: 'text-amber-500',   title: 'Align Team Actions',     text: 'Convert insights into owner-based actions and timelines.',                    type: 'warning' },
      { priority: 'LOW',  priorityColor: 'text-emerald-600', title: 'Share Executive Brief',  text: 'Share a concise summary with stakeholders for faster decisions.',             type: 'positive' },
    ]
  }, [summaryFindings])

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-white">
      <TopBar
        title="Ask AI Intelligence"
        actions={
          <div className="flex items-center gap-3">
            {activeDoc && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="material-symbols-outlined text-[14px] text-blue-600">description</span>
                <button
                  type="button"
                  onClick={handlePreviewSelectedDoc}
                  className="text-[11px] font-semibold text-blue-700 max-w-[160px] truncate hover:underline"
                  title={`Preview ${activeDoc.filename}`}
                >
                  {activeDoc.filename}
                </button>
                <button onClick={handleClearSelectedDoc} className="ml-1 text-blue-400 hover:text-blue-600">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
            )}
            {hasSummary && (
              <button
                onClick={handleExportSummary}
                className="px-3 py-1.5 border border-gray-300 text-[12px] font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export Summary
              </button>
            )}
            <span className="text-[11px] text-gray-500 font-medium">Synced with Botpress v1.0</span>
          </div>
        }
      />

      {/* ── Chat History Drawer ── */}
      {historyOpen && (
        <div
          ref={historyRef}
          className="absolute top-[56px] left-0 z-50 w-[290px] h-[calc(100%-56px)] bg-white border-r border-gray-200 shadow-2xl flex flex-col overflow-hidden"
          style={{ animation: 'slideInLeft 0.2s ease-out' }}
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600">chat_bubble</span>
              <span className="text-[13px] font-bold text-gray-800 tracking-wide">Chat History</span>
              {sessions.length > 0 && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {sessions.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                title="New Chat"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">add</span>
              </button>
              <button
                onClick={() => setHistoryOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-gray-500">close</span>
              </button>
            </div>
          </div>

          {/* New Chat button */}
          <button
            onClick={handleNewChat}
            className="mx-3 mt-3 mb-1 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all text-left group"
          >
            <span className="material-symbols-outlined text-[18px]">add_comment</span>
            <span className="text-[13px] font-semibold">New Chat</span>
          </button>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {sessions.length === 0 && (
              <div className="flex flex-col items-center justify-center pt-12 pb-8 text-center px-4">
                <span className="material-symbols-outlined text-[40px] text-gray-300 mb-3">chat_bubble_outline</span>
                <p className="text-[12px] text-gray-500 font-semibold">No chat history yet</p>
                <p className="text-[11px] text-gray-400 mt-1">Start a conversation to see it here</p>
              </div>
            )}

            {sessions.map((sess) => {
              const isActive = sess.id === sessionId
              const msgCount = sess.messages?.length || 0
              const lastMsg  = sess.messages?.filter((m) => m.role === 'ai').pop()?.text || ''

              return (
                <div
                  key={sess.id}
                  onClick={() => handleLoadSession(sess)}
                  className={`w-full cursor-pointer flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all group border ${
                    isActive
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 min-w-[32px] rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-blue-600' : 'bg-gray-100 group-hover:bg-blue-100'
                  }`}>
                    <span className={`material-symbols-outlined text-[15px] ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>
                      chat_bubble
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-semibold truncate ${isActive ? 'text-blue-700' : 'text-gray-800 group-hover:text-blue-700'}`}>
                      {sess.title || 'New Chat'}
                    </p>
                    {lastMsg && (
                      <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-relaxed">
                        {lastMsg.slice(0, 60)}{lastMsg.length > 60 ? '…' : ''}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-400">{timeAgo(sess.updatedAt)}</span>
                      <span className="text-[9px] text-gray-300">·</span>
                      <span className="text-[9px] text-gray-400">{Math.ceil(msgCount / 2)} Q&amp;A</span>
                      {isActive && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDeleteSession(e, sess.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all flex-shrink-0"
                    title="Delete chat"
                  >
                    <span className="material-symbols-outlined text-[13px] text-red-500">delete</span>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          {sessions.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400 text-center">
                {sessions.length} saved chat{sessions.length !== 1 ? 's' : ''} · stored locally
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 relative">

          {/* ── Hamburger + Dropdown ── */}
          <div ref={menuRef} className="absolute top-3 left-4 z-40">
            <button
              id="menu-toggle"
              onClick={() => setMenuOpen((p) => !p)}
              title="Menu"
              className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-[5px] border shadow-sm transition-all duration-200 ${
                menuOpen ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <span
                className={`block w-4 h-[2px] rounded-full transition-all duration-200 ${menuOpen ? 'bg-white' : 'bg-gray-500'}`}
                style={menuOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}}
              />
              <span className={`block w-4 h-[2px] rounded-full transition-all duration-200 ${menuOpen ? 'opacity-0' : 'bg-gray-500'}`} />
              <span
                className={`block w-4 h-[2px] rounded-full transition-all duration-200 ${menuOpen ? 'bg-white' : 'bg-gray-500'}`}
                style={menuOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}}
              />
            </button>

            {menuOpen && (
              <div
                className="absolute top-11 left-0 w-54 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: 'fadeSlideDown 0.15s ease-out', minWidth: '210px' }}
              >
                {/* New Chat */}
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors group border-b border-gray-100"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-white">add_comment</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">New Chat</p>
                    <p className="text-[10px] text-gray-400">Start a fresh conversation</p>
                  </div>
                </button>

                {/* Chat History */}
                <button
                  onClick={() => { setMenuOpen(false); setHistoryOpen(true) }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-white">chat_bubble</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-gray-800">Chat History</p>
                    <p className="text-[10px] text-gray-400">
                      {sessions.length > 0 ? `${sessions.length} saved conversation${sessions.length !== 1 ? 's' : ''}` : 'No history yet'}
                    </p>
                  </div>
                  {sessions.length > 0 && (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {sessions.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>



          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-8 space-y-6">
            <div className="rounded-2xl border border-surface-high bg-surface-container-lowest p-4 lg:p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold tracking-wide text-primary">Document Summary in Ask AI</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {activeDoc?.filename ? `Selected: ${activeDoc.filename}` : 'Select a document from the right panel'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateSummary(false)}
                    disabled={summaryLoading || !activeDoc?.filename}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-[12px] font-semibold hover:brightness-110 disabled:opacity-50"
                  >
                    {summaryLoading ? 'Generating...' : 'Generate Summary'}
                  </button>
                  <button
                    onClick={() => handleGenerateSummary(true)}
                    disabled={summaryLoading || !activeDoc?.filename}
                    className="px-3 py-2 rounded-lg border border-outline-variant text-[12px] font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
                    title="Force regenerate summary"
                  >
                    Refresh
                  </button>
                  {hasSummary && !summaryLoading && (
                    <button
                      onClick={handleCopySummary}
                      className="px-3 py-2 rounded-lg border border-outline-variant text-[12px] font-semibold text-on-surface-variant hover:bg-surface-container-low"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              {!summaryMinimized && (
                <>
                  {summaryLoading && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-[12px] text-on-surface-variant">{STEPS[summaryStep]}</p>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-700"
                          style={{ width: `${((summaryStep + 1) / STEPS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {summaryError && (
                    <p className="mt-3 text-[12px] text-red-600">{summaryError}</p>
                  )}

                  {!summaryLoading && !hasSummary && !summaryError && (
                    <div className="mt-3 text-center py-4">
                      <p className="text-[12px] text-on-surface-variant">Generate summary to see executive insights and actions.</p>
                    </div>
                  )}

                  {hasSummary && !summaryLoading && (
                    <div className="mt-3 space-y-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold tracking-[0.14em] text-primary uppercase">Executive Summary</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            summaryMeta.cached
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-violet-100 text-violet-700 border-violet-200'
                          }`}>
                            {summaryMeta.cached ? 'Cached' : 'Fresh'}
                          </span>
                        </div>
                        <p className="text-[12px] text-on-surface leading-relaxed whitespace-pre-wrap">{summaryText}</p>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold tracking-[0.14em] text-primary uppercase">Key Insights</p>
                          <div className="space-y-2">
                            {summaryFindings.length
                              ? summaryFindings.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-start gap-2 p-2.5 rounded-xl border ${findingBg[item.type] || findingBg.neutral}`}
                                  >
                                    <div className={`w-2 h-2 rounded-full ${findingColors[item.type] || findingColors.neutral} mt-1.5 flex-shrink-0`} />
                                    <p className={`text-[12px] leading-relaxed ${findingFg[item.type] || findingFg.neutral}`}>
                                      {item.text || String(item)}
                                    </p>
                                  </div>
                                ))
                              : <p className="text-[12px] text-on-surface-variant">No structured findings were returned.</p>
                            }
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] font-bold tracking-[0.14em] text-emerald-700 uppercase">Summary Metrics</p>
                          <div className="rounded-xl border border-surface-high bg-surface p-3 space-y-2">
                            <MetricRow label="Pages" value={summaryMeta.page_count} />
                            <MetricRow label="Word Count" value={summaryMeta.word_count.toLocaleString()} />
                            <MetricRow label="Findings" value={summaryFindings.length} />
                            <MetricRow label="Document" value={activeDoc?.filename || '—'} truncate />
                          </div>
                        </div>
                      </div>

                      {!!recommendedActions.length && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold tracking-[0.14em] text-fuchsia-700 uppercase">Recommended Actions</p>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                            {recommendedActions.map((action, idx) => (
                              <div key={`${action.title}-${idx}`} className={`p-3 rounded-xl border ${findingBg[action.type] || findingBg.neutral}`}>
                                <p className={`text-[10px] font-bold ${action.priorityColor}`}>PRIORITY: {action.priority}</p>
                                <p className="text-[12px] font-semibold text-slate-800 mt-1">{action.title}</p>
                                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{action.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="mt-4 pt-3 border-t border-surface-high flex justify-end">
                <button
                  type="button"
                  onClick={() => setSummaryMinimized((prev) => !prev)}
                  className="w-8 h-8 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center justify-center"
                  title={summaryMinimized ? 'Expand summary' : 'Minimize summary'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {summaryMinimized ? 'expand_more' : 'expand_less'}
                  </span>
                </button>
              </div>
            </div>

            {messages.length === 0 && !loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md px-6">
                  <span className="material-symbols-outlined text-[52px] text-gray-200 mb-4 block">smart_toy</span>
                  <p className="text-[15px] text-gray-800 font-bold mb-2">Initialize Conversation</p>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
                    Ask any technical or business question grounded in your uploaded documentation.
                    Your chats are saved automatically in Chat History.
                  </p>
                  <div className="flex flex-col gap-2">
                    {starters.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="w-full px-4 py-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-[12px] text-gray-600 hover:text-blue-700 font-medium text-left transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                text={msg.text}
                sources={msg.sources}
                provider={msg.provider}
                onEdit={() => handleEditMessage(msg.id, msg.text)}
                isNew={msg.id === lastAiMsgId}
              />
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-4 bg-blue-50/50 rounded-2xl w-fit">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:300ms]" />
                <span className="text-[12px] text-blue-700 font-bold ml-1">AI Thinking...</span>
              </div>
            )}

            {error && (
              <p className="text-[13px] text-red-700 font-bold bg-red-100/50 px-4 py-3 rounded-2xl border border-red-200">
                {error}
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-8 py-6 border-t border-gray-100 bg-white">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
              <div className="relative flex items-end p-4 gap-2">
                <div className="relative" ref={attachMenuRef}>
                  <button
                    type="button"
                    onClick={() => setAttachMenuOpen((prev) => !prev)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    title="Attach file"
                  >
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>

                  {attachMenuOpen && (
                    <div
                      className="absolute bottom-12 left-0 min-w-[220px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50"
                      style={{ animation: 'fadeSlideUp 0.15s ease-out' }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setAttachMenuOpen(false)
                          window.dispatchEvent(new CustomEvent('mutant:open-upload-modal'))
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-gray-500">attach_file</span>
                        <span className="text-[13px] font-semibold text-gray-700">Upload files</span>
                      </button>
                    </div>
                  )}
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask Aura anything about your documents..."
                  rows={1}
                  id="chat-input"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder:text-gray-400 py-2 resize-none max-h-40 font-body text-sm leading-relaxed outline-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSend}
                    disabled={loading}
                    className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    id="send-button"
                    title="Send"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Privacy Shield Active</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Grounded Intelligence</span>
            </div>
          </div>
        </div>

        {/* Right: Document panel */}
        <DocumentPanel
          onSelectDocument={handleSelectDocument}
          selectedFilename={activeDoc?.filename || ''}
        />
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-16px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes fadeSlideDown {
          from { transform: translateY(-8px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function MetricRow({ label, value, truncate }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[12px]">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold text-slate-800 text-right ${truncate ? 'truncate max-w-[160px]' : ''}`}>
        {value}
      </span>
    </div>
  )
}
