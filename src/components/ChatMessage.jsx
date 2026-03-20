export default function ChatMessage({ role, text, sources }) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold mt-0.5 ${
        isUser ? 'bg-accent text-white' : 'bg-surface-container text-on-surface-variant'
      }`}>
        {isUser ? 'P' : '🧠'}
      </div>

      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div className={`px-4 py-3 rounded-card text-[14px] leading-relaxed ${
          isUser
            ? 'bg-accent text-white rounded-tr-sm'
            : 'bg-surface-low text-on-surface rounded-tl-sm'
        }`}>
          {isUser ? (
            <p>{text}</p>
          ) : (
            <p className="font-medium">{text}</p>
          )}
        </div>

        {/* Source chips for AI messages */}
        {!isUser && sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  i % 2 === 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {source}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
