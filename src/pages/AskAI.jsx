import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import ChatMessage from '../components/ChatMessage'
import DocumentPanel from '../components/DocumentPanel'
import { askQuestion, getDocuments } from '../api'

export default function AskAI() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hamburger dropdown
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Recent Activity drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activities, setActivities] = useState([])
  const [actLoading, setActLoading] = useState(false)
  const drawerRef = useRef(null)

  // ── Close dropdown when clicking outside ──
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // ── Close drawer when clicking outside ──
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    if (drawerOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [drawerOpen])

  // ── Load activities when drawer opens ──
  useEffect(() => {
    if (!drawerOpen) return
    const load = async () => {
      setActLoading(true)
      try {
        const docs = await getDocuments()
        const sorted = [...docs]
          .sort((a, b) => new Date(b.uploaded_at || 0) - new Date(a.uploaded_at || 0))
          .slice(0, 10)
        setActivities(sorted)
      } catch (e) {
        console.error(e)
      } finally {
        setActLoading(false)
      }
    }
    load()
  }, [drawerOpen])

  const uploadedAgo = (iso) => {
    if (!iso) return 'Unknown'
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getIcon = (filename = '') => {
    if (filename.endsWith('.pdf')) return 'picture_as_pdf'
    if (filename.endsWith('.csv')) return 'table_chart'
    return 'description'
  }

  const handleNewChat = () => {
    setMessages([])
    setInput('')
    setError('')
    setMenuOpen(false)
  }

  const handleOpenActivity = () => {
    setMenuOpen(false)
    setDrawerOpen(true)
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const question = input
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: question }])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const data = await askQuestion(question)
      const rawSources = data.source_details
        ? (data.source_details || []).map((s) => `${s.filename} · p.${s.page}`)
        : (data.sources || [])
      const sourceChips = rawSources.map((s) =>
        typeof s === 'object' ? `${s.filename} (score: ${s.score})` : s
      )
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: data.answer,
          sources: sourceChips,
          provider: data.provider || 'ai',
        },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <TopBar
        title="Ask AI Intelligence"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500 font-medium">Synced with Botpress v1.0</span>
          </div>
        }
      />

      {/* ── Floating Recent Activity Drawer ── */}
      {drawerOpen && (
        <div
          ref={drawerRef}
          className="absolute top-[56px] left-0 z-50 w-[270px] h-[calc(100%-56px)] bg-white border-r border-gray-200 shadow-2xl flex flex-col overflow-hidden"
          style={{ animation: 'slideInLeft 0.2s ease-out' }}
        >
          {/* Drawer header */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600">history</span>
              <span className="text-[13px] font-bold text-gray-800 tracking-wide">Recent Activity</span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-gray-500">close</span>
            </button>
          </div>

          {/* Drawer body */}
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {actLoading && (
              <div className="flex flex-col gap-2 p-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[60px] rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {!actLoading && activities.length === 0 && (
              <div className="flex flex-col items-center justify-center pt-16 pb-8 text-center px-4">
                <span className="material-symbols-outlined text-[40px] text-gray-300 mb-3">inbox</span>
                <p className="text-[12px] text-gray-400 font-medium">No documents uploaded yet</p>
              </div>
            )}

            {!actLoading && activities.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-blue-50/50 transition-all cursor-default group"
              >
                <div className="w-9 h-9 min-w-[36px] rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">
                    {getIcon(doc.filename)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium mb-0.5">
                    Upload · {uploadedAgo(doc.uploaded_at)}
                  </p>
                  <p
                    className="text-[12px] font-semibold text-gray-800 truncate group-hover:text-blue-700 transition-colors"
                    title={doc.filename}
                  >
                    {doc.filename}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      doc.status === 'indexed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {doc.status || 'Processed'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!actLoading && activities.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400 text-center">
                {activities.length} document{activities.length !== 1 ? 's' : ''} in archival log
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Center: Chat area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 relative">

          {/* ── Hamburger button + dropdown ── */}
          <div ref={menuRef} className="absolute top-3 left-4 z-40">
            {/* 3-line button */}
            <button
              id="menu-toggle"
              onClick={() => setMenuOpen((p) => !p)}
              title="Menu"
              className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-[5px] transition-all duration-200 border shadow-sm ${
                menuOpen
                  ? 'bg-blue-600 border-blue-600 shadow-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <span className={`block w-4 h-[2px] rounded-full transition-all duration-200 ${menuOpen ? 'bg-white rotate-45 translate-y-[7px]' : 'bg-gray-500'}`} style={menuOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}} />
              <span className={`block w-4 h-[2px] rounded-full transition-all duration-200 ${menuOpen ? 'bg-white opacity-0' : 'bg-gray-500'}`} />
              <span className={`block w-4 h-[2px] rounded-full transition-all duration-200 ${menuOpen ? 'bg-white' : 'bg-gray-500'}`} style={menuOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}} />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                className="absolute top-11 left-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                style={{ animation: 'fadeSlideDown 0.15s ease-out' }}
              >
                {/* New Chat */}
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group border-b border-gray-100"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">add_comment</span>
                  </div>
                  <span className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900">New Chat</span>
                </button>

                {/* Recent Activity */}
                <button
                  onClick={handleOpenActivity}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-purple-600">history</span>
                  </div>
                  <span className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900">Recent Activity</span>
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-8 space-y-6">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm px-6">
                  <span className="material-symbols-outlined text-[48px] text-gray-200 mb-4 block">smart_toy</span>
                  <p className="text-[15px] text-gray-800 font-bold mb-2">Initialize Conversation</p>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Ask any technical or business question grounded in your uploaded documentation.
                    I'll provide accurate answers with direct source citations.
                  </p>
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
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200" />
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-300" />
                <span className="text-[12px] text-blue-700 font-bold ml-1">AI Thinking...</span>
              </div>
            )}
            {error && (
              <p className="text-[13px] text-red-700 font-bold bg-red-100/50 px-4 py-3 rounded-2xl border border-red-200">
                {error}
              </p>
            )}
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

        {/* Right Side: Document panel */}
        <DocumentPanel />
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-16px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes fadeSlideDown {
          from { transform: translateY(-6px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
