import { useState } from 'react'
import TopBar from '../components/TopBar'
import ChatMessage from '../components/ChatMessage'
import DocumentPanel from '../components/DocumentPanel'

const initialMessages = [
  {
    id: 1,
    role: 'user',
    text: 'What is the leave policy for interns?',
  },
  {
    id: 2,
    role: 'ai',
    text: 'Interns are entitled to 10 days of paid leave per calendar year. Leave must be approved by the direct manager at least 3 days in advance.',
    sources: ['📄 HR_Policy.pdf · Page 3', '📋 Employee_Handbook.pdf · Sec 4.2'],
  },
]

export default function AskAI() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: input }])
    setInput('')
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: 'Based on your company documents, here is the relevant information I found. Please review the cited sources for full context.',
        sources: ['📄 HR_Policy.pdf · Page 7'],
      }])
    }, 800)
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
          <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-5">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                text={msg.text}
                sources={msg.sources}
              />
            ))}
          </div>

          {/* Input area */}
          <div className="px-6 py-4 border-t border-surface-high bg-white">
            <div className="flex items-center gap-3 bg-surface-low rounded-card px-4 py-3 ghost-border">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about your company documents…"
                className="flex-1 bg-transparent text-[14px] text-on-surface placeholder-outline outline-none"
                id="chat-input"
              />
              <button
                onClick={handleSend}
                className="w-8 h-8 rounded-btn bg-primary text-white flex items-center justify-center hover:bg-accent transition-colors"
                id="send-button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-outline mt-2 text-center">
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
