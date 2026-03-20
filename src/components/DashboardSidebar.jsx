import { Link, useLocation } from 'react-router-dom';

const DashboardSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex flex-col w-64 h-full p-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-r-3xl h-screen sticky left-0 top-0 shadow-xl shadow-indigo-500/5 z-40">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-tertiary-container flex items-center justify-center text-white">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-indigo-700 dark:text-indigo-300">Mutant-AI</h1>
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">
            Intelligent Surface
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto chat-scrollbar pr-2">
        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight rounded-xl transition-all duration-300 ${
            isActive('/dashboard')
              ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30 border-l-4 border-indigo-600'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 line-clamp-1 scale-95 active:scale-90'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/dashboard') ? { fontVariationSettings: "'FILL' 1" } : {}}>
            dashboard
          </span>
          <span>Dashboard</span>
        </Link>
        {/* Chat */}
        <Link
          to="/chat"
          className={`flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight rounded-xl transition-all duration-300 ${
            isActive('/chat')
              ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30 border-l-4 border-indigo-600'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 scale-95 active:scale-90'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/chat') ? { fontVariationSettings: "'FILL' 1" } : {}}>
            chat_bubble
          </span>
          <span>Chat</span>
        </Link>

        {isActive('/chat') && (
          <>
            <div className="pt-6 pb-2 px-4">
              <span className="text-[10px] font-label font-bold text-on-surface-variant/40 uppercase tracking-widest">
                Recent Activity
              </span>
            </div>
            {/* History Items */}
            <Link to="#" className="flex flex-col gap-1 px-4 py-3 rounded-xl hover:bg-indigo-50/30 transition-all group">
              <span className="text-sm font-medium text-on-surface truncate">Q4 Strategy Analysis</span>
              <span className="text-[10px] text-on-surface-variant/60">2 hours ago</span>
            </Link>
            <Link to="#" className="flex flex-col gap-1 px-4 py-3 rounded-xl hover:bg-indigo-50/30 transition-all group">
              <span className="text-sm font-medium text-on-surface truncate">Internal Wiki: HR Policies</span>
              <span className="text-[10px] text-on-surface-variant/60">Yesterday</span>
            </Link>
            <Link to="#" className="flex flex-col gap-1 px-4 py-3 rounded-xl hover:bg-indigo-50/30 transition-all group">
              <span className="text-sm font-medium text-on-surface truncate">Revenue Forecast 2025</span>
              <span className="text-[10px] text-on-surface-variant/60">Nov 12</span>
            </Link>
          </>
        )}

        {/* Documents */}
        <Link
          to="/documents"
          className={`flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight transition-all duration-300 scale-95 active:scale-90 ${
            isActive('/documents')
              ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 rounded-r-xl'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 rounded-xl transition-transform'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/documents') ? { fontVariationSettings: "'FILL' 1" } : {}}>
            description
          </span>
          <span>Documents</span>
        </Link>
        {/* Meetings */}
        <Link
          to="/meetings"
          className={`flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight transition-all duration-300 scale-95 active:scale-90 ${
            isActive('/meetings')
              ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 rounded-xl'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 rounded-xl transition-transform'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/meetings') ? { fontVariationSettings: "'FILL' 1" } : {}}>
            groups
          </span>
          <span>Meetings</span>
        </Link>
        {/* Search */}
        <Link
          to="/search"
          className={`flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight transition-all duration-300 scale-95 active:scale-90 ${
            isActive('/search')
              ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 rounded-xl'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 rounded-xl transition-transform'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/search') ? { fontVariationSettings: "'FILL' 1" } : {}}>
            search
          </span>
          <span>Search</span>
        </Link>
        {/* Analytics */}
        <Link
          to="/analytics"
          className={`flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight transition-all duration-300 scale-95 active:scale-90 ${
            isActive('/analytics')
              ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 rounded-xl'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 rounded-xl transition-transform'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/analytics') ? { fontVariationSettings: "'FILL' 1" } : {}}>
            analytics
          </span>
          <span>Analytics</span>
        </Link>
        {/* Team */}
        <Link
          to="/team"
          className={`flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight transition-all duration-300 scale-95 active:scale-90 ${
            isActive('/team')
              ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 rounded-xl'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 rounded-xl transition-transform'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/team') ? { fontVariationSettings: "'FILL' 1" } : {}}>
            group_add
          </span>
          <span>Team</span>
        </Link>
        {/* Settings */}
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight transition-all duration-300 scale-95 active:scale-90 border-transparent ${
            isActive('/settings')
              ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 rounded-r-xl'
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 rounded-xl transition-transform'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/settings') ? { fontVariationSettings: "'FILL' 1" } : {}}>
            settings
          </span>
          <span>Settings</span>
        </Link>
      </nav>
      <div className="mt-auto pt-4 border-t border-surface-container">
        <Link
          to="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-manrope text-sm font-medium tracking-tight text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all scale-95 active:scale-90"
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span>Profile</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-300"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
