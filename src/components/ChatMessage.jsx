import { useState, useEffect, useRef } from 'react'

// Typewriter hook – streams fullText word-by-word when `animate` is true
function useTypewriter(fullText, animate, speed = 18) {
  const [displayed, setDisplayed] = useState(animate ? '' : fullText)
  const [done, setDone]           = useState(!animate)
  const idxRef                    = useRef(0)

  useEffect(() => {
    if (!animate) {
      setDisplayed(fullText)
      setDone(true)
      return
    }
    // Reset when a new message comes in
    idxRef.current = 0
    setDisplayed('')
    setDone(false)

    const interval = setInterval(() => {
      idxRef.current += 1
      setDisplayed(fullText.slice(0, idxRef.current))
      if (idxRef.current >= fullText.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [fullText, animate]) // eslint-disable-line react-hooks/exhaustive-deps

  return { displayed, done }
}

export default function ChatMessage({ role, text, sources, provider, onEdit, isNew }) {
  const [copied, setCopied]    = useState(false)
  const [visible, setVisible]  = useState(false)
  const isUser                 = role === 'user'
  const isBotpress             = provider === 'botpress'

  // Typewriter only for brand-new AI messages
  const shouldAnimate = !isUser && !!isNew
  const { displayed, done } = useTypewriter(text, shouldAnimate)

  // Slide-in entrance animation
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-semibold mt-0.5 shadow-sm ${
        isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
      }`}>
        {isUser ? 'YOU' : isBotpress ? '🤖' : '🧠'}
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Provider badge for Botpress */}
        {!isUser && isBotpress && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-900 mb-1">
            ⚡ Botpress Knowledge Base
          </span>
        )}

        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed break-words ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
            : 'bg-gray-100 text-gray-900 rounded-tl-sm border border-gray-200 shadow-sm'
        }`}>
          <div className="font-medium whitespace-pre-wrap relative">
            <span
              dangerouslySetInnerHTML={{
                __html: (shouldAnimate ? displayed : text)
                  .replace(/▯/g, ' ') // Remove PDF missing char artifact
                  .replace(/</g, '&lt;').replace(/>/g, '&gt;') // Sanitize HTML tags
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                  .replace(/\*([^*\n]+)\*/g, '<em class="italic">$1</em>')
              }}
            />
            {/* blinking cursor while typing */}
            {shouldAnimate && !done && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1em',
                  background: '#3b82f6',
                  marginLeft: '2px',
                  verticalAlign: 'text-bottom',
                  animation: 'blink 0.7s step-end infinite',
                }}
              />
            )}
          </div>
        </div>

        {/* Actions row: Copy / Edit – visible on hover */}
        <div className={`flex items-center gap-3 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${
              copied ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'
            }`}
            title="Copy message"
          >
            <span className="material-symbols-outlined text-[13px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied' : 'Copy'}
          </button>

          {isUser && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit message"
            >
              <span className="material-symbols-outlined text-[13px]">edit</span>
              Edit
            </button>
          )}
        </div>

        {/* Source chips for AI messages */}
        {!isUser && sources && sources.length > 0 && (
          <div
            className="flex flex-wrap gap-1.5 mt-1"
            style={{
              opacity:    done ? 1 : 0,
              transition: 'opacity 0.4s ease 0.1s',
            }}
          >
            {sources.map((source, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm border ${
                  isBotpress
                    ? 'bg-blue-50 text-blue-800 border-blue-100'
                    : i % 2 === 0
                    ? 'bg-amber-50 text-amber-800 border-amber-100'
                    : 'bg-green-50 text-green-800 border-green-100'
                }`}
              >
                {source}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Global blink keyframe */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
