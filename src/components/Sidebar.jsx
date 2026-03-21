import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  {
    to: '/ask-ai',
    label: 'Ask AI',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    to: '/chat',
    label: 'AI Chat',
    badge: 'New',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    to: '/summarization',
    label: 'Documents',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    to: '#',
    label: 'Search',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    to: '/categorization',
    label: 'Categories',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
]

const recentChats = [
  { id: 1, label: 'Leave policy for interns' },
  { id: 2, label: 'IT expense Q3 report' },
  { id: 3, label: 'Q3 revenue data analysis' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-[200px] min-w-[200px] h-screen bg-sidebar flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1 0-6h1V6a4 4 0 0 1 4-4z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">Mutant AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-2 pt-4 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-btn text-[13px] font-medium transition-all ${
                isActive && item.to !== '#'
                  ? 'bg-accent/20 text-accent'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            <span className="flex items-center gap-2">
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full leading-none">
                  {item.badge}
                </span>
              )}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Recent Chats */}
      <div className="px-2 mt-6 flex-1 overflow-hidden">
        <p className="px-3 text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">
          Recent Chats
        </p>
        <div className="flex flex-col gap-0.5">
          {recentChats.map((chat) => (
            <button
              key={chat.id}
              className="flex items-center gap-2 px-3 py-2 rounded-btn text-left w-full text-[12px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="truncate">{chat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer — user info + logout */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-[11px] font-semibold">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-[12px] font-medium truncate">{user?.username ?? 'User'}</p>
            <p className="text-white/30 text-[10px] truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          id="logout-btn"
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-btn text-[12px] text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
