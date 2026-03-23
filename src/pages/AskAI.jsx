import { useCallback, useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import ChatMessage from '../components/ChatMessage'
import DocumentPanel from '../components/DocumentPanel'
import { askQuestion } from '../api'

// ── localStorage helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = 'mutant_chat_sessions'

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveSessions(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)) } catch {}
}

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

// ── Component ────────────────────────────────────────────────────────────────
export default function AskAI() {
  // ── Session state ──
  const [sessions, setSessions]       = useState(loadSessions)
  const [sessionId, setSessionId]     = useState(() => makeSessionId())
  const [messages, setMessages]       = useState([])
  const [activeDoc, setActiveDoc]     = useState(null)

  // ── Chat state ──
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const messagesEndRef                = useRef(null)

  // ── UI state ──
  const [menuOpen, setMenuOpen]       = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const menuRef                       = useRef(null)
  const historyRef                    = useRef(null)

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Persist current session whenever messages change ──
  useEffect(() => {
    if (messages.length === 0) return          // don't save empty sessions
    const firstQ = messages.find((m) => m.role === 'user')?.text || ''
    setSessions((prev) => {
      const existing = prev.find((s) => s.id === sessionId)
      const updated  = {
        id:        sessionId,
        title:     existing?.title || makeTitle(firstQ),
        messages,
        activeDoc,
        updatedAt: new Date().toISOString(),
        createdAt: existing?.createdAt || new Date().toISOString(),
      }
      const rest    = prev.filter((s) => s.id !== sessionId)
      const next    = [updated, ...rest].slice(0, 50)   // keep last 50 sessions
      saveSessions(next)
      return next
    })
  }, [messages])   // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Send message ──
  const sendMessage = useCallback(async (question) => {
    if (!question?.trim()) return
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: question }])
    setInput('')
    setLoading(true)
    setError('')
    try {
      const data = await askQuestion(question)
      const rawSources = data.source_details
        ? data.source_details.map((s) => `${s.filename} · p.${s.page}`)
        : (data.sources || [])
      const sourceChips = rawSources.map((s) =>
        typeof s === 'object' ? `${s.filename} (score: ${s.score})` : s
      )
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: data.answer, sources: sourceChips, provider: data.provider || 'ai' },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSend = () => sendMessage(input)

  // ── New Chat ──
  const handleNewChat = () => {
    setSessionId(makeSessionId())
    setMessages([])
    setInput('')
    setError('')
    setActiveDoc(null)
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
    setHistoryOpen(false)
    setMenuOpen(false)
  }

  // ── Delete a session ──
  const handleDeleteSession = (e, sessId) => {
    e.stopPropagation()
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessId)
      saveSessions(next)
      return next
    })
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

  const currentSession = sessions.find((s) => s.id === sessionId)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <TopBar
        title="Ask AI Intelligence"
        actions={
          <div className="flex items-center gap-3">
            {activeDoc && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="material-symbols-outlined text-[14px] text-blue-600">description</span>
                <span className="text-[11px] font-semibold text-blue-700 max-w-[160px] truncate" title={activeDoc.filename}>
                  {activeDoc.filename}
                </span>
                <button onClick={() => setActiveDoc(null)} className="ml-1 text-blue-400 hover:text-blue-600">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
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
                <button
                  key={sess.id}
                  onClick={() => handleLoadSession(sess)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all group border ${
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
                </button>
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

          {/* Chat title strip (when session has title) */}
          {currentSession?.title && messages.length > 0 && (
            <div className="absolute top-3 left-16 right-4 z-30 flex items-center">
              <span className="text-[12px] font-semibold text-gray-500 truncate max-w-xs" title={currentSession.title}>
                {currentSession.title}
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-8 space-y-6">
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
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message AI about your company archival data…"
                className="flex-1 bg-transparent text-[14px] text-gray-800 placeholder-gray-400 outline-none font-medium"
                id="chat-input"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                id="send-button"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Privacy Shield Active</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Grounded Intelligence</span>
            </div>
          </div>
        </div>

        {/* Right: Document panel */}
        <DocumentPanel />
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
      `}</style>
    </div>
  )
}
