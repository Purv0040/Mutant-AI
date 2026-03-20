const SettingsPage = () => {
  return (
    <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full flex flex-col min-h-screen">
      {/* Header Section */}
      <header className="mb-12">
        <h2 className="text-4xl lg:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
          Workspace Control
        </h2>
        <p className="text-on-surface-variant font-body text-lg">Manage your intelligence parameters and architectural settings.</p>
      </header>
      {/* Bento Layout for Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Sidebar Navigation (Internal) */}
        <div className="lg:col-span-3 space-y-2">
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-surface-container-highest text-primary font-semibold transition-all">
            <span className="material-symbols-outlined">person</span>
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all font-medium">
            <span className="material-symbols-outlined">corporate_fare</span>
            Organization
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all font-medium">
            <span className="material-symbols-outlined">key</span>
            API Keys
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all font-medium">
            <span className="material-symbols-outlined">verified_user</span>
            Security
          </button>
        </div>
        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
          {/* Appearance Card (Asymmetric Layout) */}
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
              <div>
                <h3 className="text-xl font-bold font-headline mb-1">Visual Architecture</h3>
                <p className="text-sm text-on-surface-variant">Toggle between light and dark ethereal modes.</p>
              </div>
              <div className="flex bg-surface-container-low p-1.5 rounded-full shadow-inner">
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-primary shadow-md font-semibold transition-all">
                  <span className="material-symbols-outlined text-lg">light_mode</span>
                  Light
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full text-on-surface-variant hover:text-primary transition-all font-semibold">
                  <span className="material-symbols-outlined text-lg">dark_mode</span>
                  Dark
                </button>
              </div>
            </div>
          </div>
          {/* API Key Section */}
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold font-headline mb-1">Mutant API Connectivity</h3>
                <p className="text-sm text-on-surface-variant">Integrate Mutant-AI intelligence into your own infrastructure.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold tracking-widest uppercase">
                Live Connection
              </span>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-wider uppercase">
                Production API Key
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface-container-low px-6 py-4 rounded-xl font-mono text-sm text-on-surface flex items-center justify-between group cursor-pointer hover:bg-surface-container">
                  <span>sk-mutant-•••••••••••••••••••••78d2</span>
                  <div className="flex gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button className="hover:text-primary transition-colors" title="Copy Key">
                      <span className="material-symbols-outlined">content_copy</span>
                    </button>
                    <button className="hover:text-primary transition-colors" title="Regenerate">
                      <span className="material-symbols-outlined">refresh</span>
                    </button>
                  </div>
                </div>
                <button className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                  <span className="material-symbols-outlined">add</span>
                  Create New
                </button>
              </div>
            </div>
          </div>
          {/* Indexing & Storage (Grid Sub-Section) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Storage Slider Card */}
            <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold font-headline mb-1">Knowledge Storage</h3>
                <p className="text-sm text-on-surface-variant mb-8">Total vector memory allocation.</p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-on-surface-variant">Usage</span>
                  <span className="text-primary font-bold">12.4 GB / 50 GB</span>
                </div>
                <div className="relative h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-tertiary-container rounded-full"
                    style={{ width: '25%' }}
                  ></div>
                  <input
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    max="100"
                    min="0"
                    type="range"
                    defaultValue="25"
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed italic">
                  Optimization is running in the background. Your next billing cycle starts in 12 days.
                </p>
              </div>
            </div>
            {/* Indexing Controls Card */}
            <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5">
              <h3 className="text-xl font-bold font-headline mb-1">Indexing Engine</h3>
              <p className="text-sm text-on-surface-variant mb-8">Synchronize and refresh your data corpus.</p>
              <div className="flex flex-col gap-4">
                <button className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-indigo-600">sync</span>
                  Re-index all clusters
                </button>
                <button className="w-full border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant font-medium py-4 rounded-xl transition-all">
                  View Indexing Logs
                </button>
              </div>
            </div>
          </div>
          {/* User Profile Section */}
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5">
            <div className="flex items-start gap-8">
              <div className="relative">
                <img
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                  data-alt="Portrait of a modern professional man"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW-FmWnFhPEQsjFDlOJZz_lKjTAnnF4RzxtJe2O6UY_S-TaSvuIVlwC9CMlC9NCiipaoLR4E7XaUzuUN2qSvkH-Eg9VdzQmX-wnwBzX-pPR9F6pEowUeh5HwLd41p9Kicdrms0wQHvt0hht9z0iBWWT0ErDBqMVtQ2-OA29cBEB6kVrpN3fEUciAoRa4P__7MmW6m3oFaD6koamoZM_OWd-aCZuJLpC_KNLGDykNn84BxvjtJrg6qXXp_YYjg-kdCatrj8luAq_qY"
                />
                <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md text-primary hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
                    Full Name
                  </label>
                  <p className="text-lg font-semibold border-b border-transparent hover:border-surface-variant transition-all pb-1">
                    Alexander Vance
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
                    Email Address
                  </label>
                  <p className="text-lg font-semibold border-b border-transparent hover:border-surface-variant transition-all pb-1">
                    a.vance@mutant-ai.tech
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
                    Organization
                  </label>
                  <p className="text-lg font-semibold border-b border-transparent hover:border-surface-variant transition-all pb-1">
                    Vance Intelligence Lab
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
                    Access Role
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Global Admin</span>
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Shared Footer Component */}
      <footer className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-manrope font-bold text-slate-900 dark:text-white">Mutant-AI</p>
          <p className="font-inter text-xs text-slate-500">© 2024 Mutant-AI. The Ethereal Archivist.</p>
        </div>
        <div className="flex items-center gap-8">
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity" href="#">
            Privacy
          </a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity" href="#">
            Terms
          </a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity" href="#">
            Documentation
          </a>
          <div className="flex items-center gap-4 ml-4">
            <a className="text-slate-400 hover:text-indigo-500 transition-colors" href="#">
              <span className="material-symbols-outlined text-lg">public</span>
            </a>
            <a className="text-slate-400 hover:text-indigo-500 transition-colors" href="#">
              <span className="material-symbols-outlined text-lg">code</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default SettingsPage;
