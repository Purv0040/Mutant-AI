export default function ChatMessage({ role, text, sources, provider }) {
  const isUser = role === 'user'
  const isBotpress = provider === 'botpress'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-semibold mt-0.5 ${
        isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
      }`}>
        {isUser ? 'YOU' : isBotpress ? '🤖' : '🧠'}
      </div>

      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Provider badge for Botpress */}
        {!isUser && isBotpress && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-900">
            ⚡ Botpress Knowledge Base
          </span>
        )}

        {/* Bubble */}
        <div className={`px-4 py-3 rounded-lg text-[14px] leading-relaxed break-words ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none shadow-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
        }`}>
          {isUser ? (
            <p className="font-medium">{text}</p>
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
                  isBotpress
                    ? 'bg-blue-100 text-blue-900'
                    : i % 2 === 0
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
