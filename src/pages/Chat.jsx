import { useEffect, useRef, useState } from 'react'

const BOTPRESS_SCRIPT_ID = 'botpress-webchat-script'

export default function Chat() {
  const [botReady, setBotReady] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    const clientId = import.meta.env.VITE_BOTPRESS_CLIENT_ID
    if (!clientId) {
      console.error('VITE_BOTPRESS_CLIENT_ID is not set')
      return () => {}
    }

    let canceled = false

    const setupBotpress = () => {
      if (canceled || initializedRef.current || !window.botpress) return

      initializedRef.current = true

      window.botpress.on('ready', () => {
        if (canceled) return
        setBotReady(true)

        try {
          const rawUser = localStorage.getItem('mutant_user')
          const user = rawUser ? JSON.parse(rawUser) : {}
          window.botpress.sendEvent({
            type: 'setUser',
            payload: {
              name: user.name || user.username || 'Mutant User',
              email: user.email || '',
            },
          })
        } catch (error) {
          console.error('Failed to set Botpress user', error)
        }
      })

      window.botpress.init({
        clientId,
        selector: '#bp-chat-container',
      })
    }

    const existingScript = document.getElementById(BOTPRESS_SCRIPT_ID)
    if (existingScript) {
      if (window.botpress) {
        setupBotpress()
      } else {
        existingScript.addEventListener('load', setupBotpress)
      }
    } else {
      const script = document.createElement('script')
      script.id = BOTPRESS_SCRIPT_ID
      script.src = 'https://cdn.botpress.cloud/webchat/v2.2/inject.js'
      script.async = true
      script.onload = setupBotpress
      document.body.appendChild(script)
    }

    return () => {
      canceled = true
      if (window.botpress?.close) {
        window.botpress.close()
      }
    }
  }, [])

  return (
    <main className="flex-1 flex flex-col bg-surface min-h-screen p-6 md:p-8">
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-primary">AI Chat</h1>
          <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
            <span className={`w-2.5 h-2.5 rounded-full ${botReady ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            <span>{botReady ? 'Bot ready' : 'Connecting...'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
          Upload documents from the sidebar first - new documents take ~30 seconds to become searchable.
        </div>

        {!botReady && (
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin"></span>
            <span>Connecting to Botpress...</span>
          </div>
        )}

        <div className="rounded-xl border border-outline-variant/30 bg-white p-2 md:p-3 shadow-sm">
          <div id="bp-chat-container" style={{ width: '100%', height: '100%', minHeight: '500px' }} />
        </div>
      </div>
    </main>
  )
}
