const DashboardPage = () => {
  return (
    <main className="w-full h-full p-8 lg:p-12 overflow-y-auto min-h-screen">
      {/* Top App Bar Content */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <p className="text-label-sm font-label uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Systems Operational
          </p>
          <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface font-headline">
            Intelligence <span className="text-primary">Overview</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm">
            <img
              alt="User Avatar"
              className="w-full h-full object-cover"
              data-alt="Close up portrait of a professional man"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmr_UpAGGzuUQ0Nnm8V34JSslbr5FUIcVn-GXlLdlBCnDH4yhIaGdJ9KCxO7sXYpNl9ffbFawt_ABpwyOw1e0jMEH5LFOzjBdwtuWjTsv-gJuTDcqXClBVb2vpkyOGHJgMzp5ITb6R--tJZ7v4KnSRC8ZwpORNr175CCaK_J-zL3azW1H1MdeG7iWGRBJWtvoanMGgHXJRMmEh2BUZtyqGOXHf0eYIGWctu_cTHtSmf962Ny-cvH8RKn9J64Tj88hUXtzh6lFxDXg"
            />
          </div>
        </div>
      </header>
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed rounded-2xl group-hover:bg-primary-container group-hover:text-white transition-colors">
              <span className="material-symbols-outlined" data-icon="folder_managed">
                folder_managed
              </span>
            </div>
            <span className="text-xs font-bold text-secondary">+12% vs LY</span>
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface mb-1">1,240</div>
          <div className="text-sm font-body text-on-surface-variant">Total Documents</div>
        </div>
        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed rounded-2xl group-hover:bg-primary-container group-hover:text-white transition-colors">
              <span className="material-symbols-outlined" data-icon="query_stats">
                query_stats
              </span>
            </div>
            <span className="text-xs font-bold text-primary">Live</span>
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface mb-1">85</div>
          <div className="text-sm font-body text-on-surface-variant">Queries Today</div>
        </div>
        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed rounded-2xl group-hover:bg-primary-container group-hover:text-white transition-colors">
              <span className="material-symbols-outlined" data-icon="videocam">
                videocam
              </span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant">4 Active</span>
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface mb-1">12</div>
          <div className="text-sm font-body text-on-surface-variant">Meetings Processed</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity: Editorial Highlight */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-headline tracking-tight text-on-surface">Archival Log</h2>
            <button className="text-primary text-sm font-bold hover:underline">View Analytics</button>
          </div>
          <div className="bg-surface-container-low rounded-lg p-1 space-y-1">
            {/* Activity Item 1 */}
            <div className="bg-surface-container-lowest p-6 rounded-lg flex items-center gap-6 transition-all hover:scale-[1.01]">
              <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined" data-icon="search">
                  search
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm text-on-surface-variant mb-1">AI Query • 14 mins ago</div>
                <div className="font-headline text-lg font-semibold">"Analyze Q4 revenue projections for EMEA"</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high text-[10px] font-bold uppercase tracking-wider">
                  Processed
                </span>
              </div>
            </div>
            {/* Activity Item 2 */}
            <div className="bg-surface-container-lowest p-6 rounded-lg flex items-center gap-6 transition-all hover:scale-[1.01]">
              <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined" data-icon="upload_file">
                  upload_file
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm text-on-surface-variant mb-1">Upload • 2 hours ago</div>
                <div className="font-headline text-lg font-semibold">Annual_Report_2023_Final.pdf</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-fixed text-primary text-[10px] font-bold uppercase tracking-wider">
                  Indexing
                </span>
              </div>
            </div>
            {/* Activity Item 3 */}
            <div className="bg-surface-container-lowest p-6 rounded-lg flex items-center gap-6 transition-all hover:scale-[1.01]">
              <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined" data-icon="forum">
                  forum
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm text-on-surface-variant mb-1">Meeting Transcript • 5 hours ago</div>
                <div className="font-headline text-lg font-semibold">Product Strategy Sync - Sync with AI Agent</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high text-[10px] font-bold uppercase tracking-wider">
                  Summarized
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-2xl font-bold font-headline tracking-tight text-on-surface">Accelerators</h2>
          <div className="grid grid-cols-1 gap-4">
            <button className="flex items-center justify-between p-6 bg-primary text-white rounded-lg transition-all hover:opacity-90 active:scale-95 group shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-4">
                <span
                  className="material-symbols-outlined text-3xl"
                  data-icon="add_circle"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add_circle
                </span>
                <div className="text-left">
                  <div className="font-bold">New Chat</div>
                  <div className="text-xs opacity-70">Initialize Intelligence</div>
                </div>
              </div>
              <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity" data-icon="arrow_forward">
                arrow_forward
              </span>
            </button>
            <button className="flex items-center justify-between p-6 bg-surface-container-highest text-on-surface rounded-lg transition-all hover:bg-surface-container-high active:scale-95 group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-3xl text-primary" data-icon="cloud_upload">
                  cloud_upload
                </span>
                <div className="text-left">
                  <div className="font-bold">Upload Doc</div>
                  <div className="text-xs text-on-surface-variant">PDF, DOCX, CSV</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity" data-icon="arrow_forward">
                arrow_forward
              </span>
            </button>
            <button className="flex items-center justify-between p-6 bg-surface-container-highest text-on-surface rounded-lg transition-all hover:bg-surface-container-high active:scale-95 group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-3xl text-primary" data-icon="meet">
                  video_chat
                </span>
                <div className="text-left">
                  <div className="font-bold">Start Meeting</div>
                  <div className="text-xs text-on-surface-variant">Real-time Transcription</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity" data-icon="arrow_forward">
                arrow_forward
              </span>
            </button>
          </div>
          {/* Insights Fragment */}
          <div className="mt-8 p-8 bg-gradient-to-br from-indigo-600 to-tertiary-container rounded-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-4">AI Proactive Insight</div>
              <div className="text-2xl font-headline font-bold leading-tight mb-4">
                "Your document frequency has increased by 40% this week. Would you like a weekly summary?"
              </div>
              <button className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold hover:bg-white/30 transition-colors">
                Generate Report
              </button>
            </div>
            <span
              className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 rotate-12"
              data-icon="auto_awesome"
            >
              auto_awesome
            </span>
          </div>
        </div>
      </div>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-3xl" data-icon="search">
            search
          </span>
        </button>
      </div>
    </main>
  );
};

export default DashboardPage;
