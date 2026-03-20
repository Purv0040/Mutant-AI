const DocumentsPage = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      {/* TopNavBar Component */}
      <header className="flex justify-between items-center px-8 py-4 max-w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 w-full z-30 no-border space-y-0 shadow-none">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-headline">Documents</h2>
          <nav className="hidden md:flex items-center gap-6">
            <a
              className="font-manrope text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 pb-1"
              href="#"
            >
              Features
            </a>
            <a
              className="font-manrope text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors"
              href="#"
            >
              Pricing
            </a>
            <a
              className="font-manrope text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors"
              href="#"
            >
              About
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-600 hover:text-indigo-600 transition-colors opacity-80 hover:opacity-100">
              <span className="material-symbols-outlined" data-icon="notifications">
                notifications
              </span>
            </button>
            <button className="p-2 text-slate-600 hover:text-indigo-600 transition-colors opacity-80 hover:opacity-100">
              <span className="material-symbols-outlined" data-icon="settings">
                settings
              </span>
            </button>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3 pl-2">
            <img
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10"
              data-alt="Close up profile picture of a professional man"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-5mlGtLPvxh5BSeDxkaFyhDSmTMPQmvQY-cqzuAih7k_9oUCKtzrwR8_aRbow1x08dtfkeVKwi_x9MflenoaiTGTT9K8utLw4XPfNUI5uQcWZNDtCaw_dxJahZmTPvWPmIq7TMhTu3vdtIefJF-btqNzNDi2CMbTZr_EdTiDQAJzBt_B4rhUy3HmkU9JbWwHDZST5Q6894WcVsbcYEyDXO3YQhperplBMt_2pysuWvDqu7Rw6nw1BKcb-Wn0B9tYUkCXzrAaSXFY"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-bold font-headline">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 font-medium">Pro Plan</p>
            </div>
          </div>
        </div>
      </header>
      <div className="pt-8 px-12 pb-12 overflow-y-auto flex-1">
        {/* Hero Section: Drag & Drop Zone */}
        <section className="mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-tertiary/20 to-primary/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col items-center justify-center p-12 bg-surface-container-lowest border-2 border-dashed border-outline-variant/50 rounded-lg text-center hover:border-primary/50 transition-all cursor-pointer">
              <div className="w-16 h-16 mb-4 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-3xl" data-icon="cloud_upload">
                  cloud_upload
                </span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-2">Upload your intelligence</h3>
              <p className="text-on-surface-variant max-w-md mx-auto mb-6">
                Drag and drop files here, or click to browse. We support PDF, Excel, and Powerpoint documents.
              </p>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-primary text-white rounded-lg font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Select Files
                </button>
                <button className="px-6 py-2.5 bg-surface-container-highest text-primary rounded-lg font-headline font-bold text-sm hover:bg-surface-container-high transition-all">
                  Import from Drive
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* Search & Filters */}
        <section className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full md:w-96 group">
            <span
              className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"
              data-icon="search"
            >
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              placeholder="Search archives..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-sm" data-icon="filter_list">
                filter_list
              </span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-sm" data-icon="sort">
                sort
              </span>
              Sort
            </button>
          </div>
        </section>
        {/* Document Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Card 1: PDF */}
          <div className="group bg-surface-container-lowest p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-2xl" data-icon="picture_as_pdf">
                  picture_as_pdf
                </span>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-on-surface hover:bg-slate-100 rounded-md transition-colors">
                <span className="material-symbols-outlined" data-icon="more_vert">
                  more_vert
                </span>
              </button>
            </div>
            <h4 className="font-headline font-bold text-on-surface mb-1 truncate pr-4">Quarterly_Report_Q3.pdf</h4>
            <p className="text-[10px] font-label text-slate-400 uppercase tracking-widest mb-4">2.4 MB • Oct 12, 2023</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-tight">
                Indexed
              </span>
              <div className="flex -space-x-2">
                <img
                  alt="Team"
                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  data-alt="Small avatar of a team member"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCsbeC4kIBwpCSijNXKppY5MnRJ5c6jKgCzNUru8dVCv0F1IyKybIP6oRpIF2NakYUF5GjFvK5CEbcVjbKof3oIzwgu-eoRRJfe2Vr7IMfPzYpwtTTALbGoVynjgN8tfGjBfnEvHJSh84oegaCzdQiJYcvbZzeLzE3QdX3Z6PFeKkNuDdfy6oXP4i21YLH3G1wm-LbiSqOGOvqdR9drfckcWqVC_L0C_ERfDXm5y9V9S95bfyHlJO46gs1opokojt1aHlipoOrZ8s"
                />
                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                  +2
                </div>
              </div>
            </div>
          </div>
          {/* Card 2: XLS */}
          <div className="group bg-surface-container-lowest p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-2xl" data-icon="table_view">
                  table_view
                </span>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-on-surface hover:bg-slate-100 rounded-md transition-colors">
                <span className="material-symbols-outlined" data-icon="more_vert">
                  more_vert
                </span>
              </button>
            </div>
            <h4 className="font-headline font-bold text-on-surface mb-1 truncate pr-4">Financial_Forecast_2024.xls</h4>
            <p className="text-[10px] font-label text-slate-400 uppercase tracking-widest mb-4">840 KB • Oct 15, 2023</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-tight">
                Processing
              </span>
              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
          {/* Card 3: PPT */}
          <div className="group bg-surface-container-lowest p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <span className="material-symbols-outlined text-2xl" data-icon="present_to_all">
                  present_to_all
                </span>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-on-surface hover:bg-slate-100 rounded-md transition-colors">
                <span className="material-symbols-outlined" data-icon="more_vert">
                  more_vert
                </span>
              </button>
            </div>
            <h4 className="font-headline font-bold text-on-surface mb-1 truncate pr-4">Investor_Deck_v2.ppt</h4>
            <p className="text-[10px] font-label text-slate-400 uppercase tracking-widest mb-4">12.8 MB • Oct 10, 2023</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-tight">
                Indexed
              </span>
              <span className="material-symbols-outlined text-slate-300 text-lg" data-icon="star" data-weight="fill">
                star
              </span>
            </div>
          </div>
          {/* Card 4: Failed */}
          <div className="group bg-surface-container-lowest p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                <span className="material-symbols-outlined text-2xl" data-icon="description">
                  description
                </span>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-on-surface hover:bg-slate-100 rounded-md transition-colors">
                <span className="material-symbols-outlined" data-icon="more_vert">
                  more_vert
                </span>
              </button>
            </div>
            <h4 className="font-headline font-bold text-on-surface mb-1 truncate pr-4">Unknown_Data_Log.txt</h4>
            <p className="text-[10px] font-label text-slate-400 uppercase tracking-widest mb-4">15 KB • Oct 14, 2023</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="px-3 py-1 bg-red-50 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-tight">
                Failed
              </span>
              <button className="text-xs font-bold text-primary hover:underline">Retry</button>
            </div>
          </div>
          {/* Additional Bento-style Cards */}
          <div className="group bg-surface-container-lowest p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined text-2xl" data-icon="picture_as_pdf">
                  picture_as_pdf
                </span>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-on-surface hover:bg-slate-100 rounded-md transition-colors">
                <span className="material-symbols-outlined" data-icon="more_vert">
                  more_vert
                </span>
              </button>
            </div>
            <h4 className="font-headline font-bold text-on-surface mb-1 truncate pr-4">Product_Roadmap_2024.pdf</h4>
            <p className="text-[10px] font-label text-slate-400 uppercase tracking-widest mb-4">5.1 MB • Sep 28, 2023</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-tight">
                Indexed
              </span>
              <span className="material-symbols-outlined text-slate-300 text-lg" data-icon="lock">
                lock
              </span>
            </div>
          </div>
          <div className="group bg-surface-container-lowest p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-2xl" data-icon="table_view">
                  table_view
                </span>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-on-surface hover:bg-slate-100 rounded-md transition-colors">
                <span className="material-symbols-outlined" data-icon="more_vert">
                  more_vert
                </span>
              </button>
            </div>
            <h4 className="font-headline font-bold text-on-surface mb-1 truncate pr-4">Sales_Transactions_Oct.xls</h4>
            <p className="text-[10px] font-label text-slate-400 uppercase tracking-widest mb-4">3.2 MB • Oct 01, 2023</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-tight">
                Indexed
              </span>
            </div>
          </div>
          {/* Placeholder/Empty Card for Bento Visual Balance */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary/5 to-tertiary/5 border-2 border-dashed border-primary/10 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary mb-3 shadow-sm">
              <span className="material-symbols-outlined" data-icon="add">
                add
              </span>
            </div>
            <p className="font-headline font-bold text-primary">Add Workspace</p>
            <p className="text-[10px] font-label text-slate-500 mt-1 uppercase tracking-widest">Connect external sources</p>
          </div>
        </section>
      </div>
      {/* Footer Component */}
      <footer className="mt-auto flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 tonal-shift-bg">
        <div className="mb-4 md:mb-0">
          <p className="font-manrope font-bold text-slate-900 dark:text-white">Mutant-AI</p>
          <p className="font-inter text-xs text-slate-500 mt-1">© 2024 Mutant-AI. The Ethereal Archivist.</p>
        </div>
        <div className="flex gap-8">
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity duration-200" href="#">
            Privacy
          </a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity duration-200" href="#">
            Terms
          </a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity duration-200" href="#">
            Documentation
          </a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity duration-200" href="#">
            Twitter
          </a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity duration-200" href="#">
            LinkedIn
          </a>
        </div>
      </footer>
      {/* Floating Action Button - Only for key Document actions */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-2xl" data-icon="add">
          add
        </span>
      </button>
    </div>
  );
};

export default DocumentsPage;
