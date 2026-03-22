import { useState } from 'react'
import TopBar from '../components/TopBar'
import ChatMessage from '../components/ChatMessage'
import DocumentPanel from '../components/DocumentPanel'
import { askQuestion } from '../api'

export default function AskAI() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return
    const question = input
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: question }])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const data = await askQuestion(question)
      
      // Handle both old and new response formats
      // sources can be [{filename, score}] objects or plain strings
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
    <div className="flex flex-col h-full">
      <TopBar
        title="Ask AI"
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 bg-primary text-white text-[13px] font-medium rounded-btn hover:bg-accent transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Upload Document
          </button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-5 bg-white">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-[14px] text-gray-600 font-medium mb-2">No conversations yet</p>
                  <p className="text-[13px] text-gray-500">Ask a question after uploading a document to see grounded answers with citations.</p>
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
            {loading && <p className="text-[13px] text-gray-600 font-medium">🤖 Thinking...</p>}
            {error && <p className="text-[13px] text-red-700 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          </div>

          {/* Input area */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3 bg-gray-50 rounded-card px-4 py-3 border border-gray-300">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about your company documents…"
                className="flex-1 bg-transparent text-[14px] text-gray-800 placeholder-gray-400 outline-none"
                id="chat-input"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-8 h-8 rounded-btn bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                id="send-button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 text-center">
              Answers generated from uploaded documents only · Sources always cited
            </p>
          </div>
        </div>

        {/* Document panel */}
        <DocumentPanel />
      </div>
    </div>
  )
}
