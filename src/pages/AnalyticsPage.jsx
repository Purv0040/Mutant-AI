const AnalyticsPage = () => {
  return (
    <main className="flex-1 flex flex-col p-10 max-w-[1400px] mx-auto w-full">
      {/* Header Section */}
      <header className="mb-12">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-primary font-label text-[10px] uppercase tracking-[0.2em] mb-2 block font-semibold">
              Intelligence Overview
            </span>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Analytics Hub</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-surface-container-low px-4 py-2 rounded-full flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
              <span className="text-sm font-medium text-on-surface-variant">Last 30 Days</span>
            </div>
            <button className="bg-primary text-white px-6 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span> Export Report
            </button>
          </div>
        </div>
      </header>

      {/* Metrics Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-fixed-dim rounded-2xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                timer
              </span>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">-12% vs last mo</span>
          </div>
          <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-1">Avg. Response Time</p>
          <h3 className="text-4xl font-headline font-black text-on-surface">
            1.2<span className="text-lg font-medium ml-1">s</span>
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group border-l-4 border-indigo-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary-fixed rounded-2xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
          </div>
          <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-1">Most Active User</p>
          <div className="flex items-center gap-3">
            <img
              alt="Sarah J."
              className="w-10 h-10 rounded-full object-cover"
              data-alt="Professional headshot of a smiling female executive"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJzhcIgyXP8NAPZsKvpWVOcZUdguBVUyOEK5_9EnumtLfJR-v51Il7WdZShjZkGAKpr8rcdANU_YaE9NEX7VyIcKW-QDDy4HtPd5atLHU_JBIBYwH0sF8x6HQfsuYsMhbf7msHa0pBmFl2KC5I2QMHVkVZuttwcN-J7ph7tgWsl9naxy-oD5Gry0LCg3inIM59LTCsqtXHDLVzYPgL2rzXaoimNwa7tumNqAoQeNecjQuHWamQERrEVoTJzAC1MpUC3e-9q3K2bAA"
            />
            <h3 className="text-2xl font-headline font-bold text-on-surface">Sarah Jenkins</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary-fixed rounded-2xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                library_books
              </span>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">+4.2%</span>
          </div>
          <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-1">Knowledge Coverage</p>
          <h3 className="text-4xl font-headline font-black text-on-surface">
            94.8<span className="text-lg font-medium ml-1">%</span>
          </h3>
        </div>
      </section>

      {/* Main Charts Section (Bento Style) */}
      <section className="grid grid-cols-12 gap-8">
        {/* Large Chart: Queries Over Time */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-lg p-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h4 className="text-xl font-headline font-bold text-on-surface">Queries Over Time</h4>
              <p className="text-sm text-on-surface-variant">Daily volume of AI interactions across the surface</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white text-primary shadow-sm">Line</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-on-surface-variant hover:bg-white/50 transition-colors">
                Bar
              </button>
            </div>
          </div>
          <div className="w-full h-80 relative bg-surface-container-lowest rounded-xl overflow-hidden flex items-end">
            <img
              alt="Line chart showing growth in queries"
              className="w-full h-full object-cover opacity-80"
              data-alt="Line chart visualization showing a steady upward trend in data points"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr1lXxFN91HFfk6RId5aiUGaGu_-RTGMe5qFbUXefuKXPdGsxMj9QJEqWquVWV7dO3AGz5xlxnFv2xawkyCVVJmScQ-XUwxPVY0zQHNX0YmqUvrFc50S7sjydwHZsskxjMDqY3N2w5dyKjYJGIHRf4Ztq_3xsRpLawOQMj4LHR3yc1yWSk3ubSZ6m3dRYtGWZHKhnWBepofjPKlHD-mZdZ86U8o-w8bkBE_3s8A6S73eZA0s6CJpu5jGue8CAQLlFwYsc-l_Pj2tE"
            />
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/40 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Small Chart: Distribution */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-lg p-8 shadow-sm">
          <h4 className="text-xl font-headline font-bold text-on-surface mb-2">Knowledge Mix</h4>
          <p className="text-sm text-on-surface-variant mb-8">Document type distribution</p>
          <div className="aspect-square relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1/2 h-1/2 bg-white rounded-full flex flex-col items-center justify-center shadow-lg z-10">
                <span className="text-xs font-bold text-slate-400">Total</span>
                <span className="text-lg font-bold font-headline">1.2k</span>
              </div>
            </div>
            <img
              alt="Pie chart"
              className="w-full h-full object-cover rounded-full"
              data-alt="Minimalist colorful pie chart showing document distribution"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbnIBe257-q5u06HVtQ2wX_9CZkjphPzmlKWPstKx0A3pE-vidxkKVypjAAIuSZeuQZdI-fWtEGAK2tfdR6X1wYp-1ruDNcnC_UuLY0WTSW5GiJ8XmGYWfiYxd-zA6AlYQ6EUq-2PYE_NBh1rJiVNmrjudCn0ZlshVm4Asmgd8KTn9rIHuHXOm74EmdT_GB9yPGikbS6mQ6LJs3Yn15B9RngKl0K-_kJqQe0oRszi9IIhDRyfrBcn8HKrviykPVBhBUcRndH3ekBU"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="font-medium">Technical Docs</span>
              </div>
              <span className="font-bold">45%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                <span className="font-medium">Meeting Transcripts</span>
              </div>
              <span className="font-bold">30%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <span className="font-medium">Market Research</span>
              </div>
              <span className="font-bold">25%</span>
            </div>
          </div>
        </div>

        {/* Bottom Full Width Chart: Heatmap */}
        <div className="col-span-12 bg-white rounded-lg p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-xl font-headline font-bold text-on-surface">Team Usage Heatmap</h4>
              <p className="text-sm text-on-surface-variant">Identification of peak activity periods across departments</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
              <span>Less active</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-indigo-50 rounded-sm"></div>
                <div className="w-4 h-4 bg-indigo-200 rounded-sm"></div>
                <div className="w-4 h-4 bg-indigo-400 rounded-sm"></div>
                <div className="w-4 h-4 bg-primary rounded-sm"></div>
              </div>
              <span>Highly active</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <img
              alt="Heatmap graph"
              className="w-full h-48 object-cover rounded-xl"
              data-alt="Grid-based heatmap chart showing varied density in indigo shades"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNJQnMBQHGPkIDplqtXxRkn-nA8R5G09E2xwc8cBkmKpfvlc1v0Ov_OVcwLS2wkDc_stB3iOOxcgBIvbUqjTB9LeokuStvrdidJUXRrpcYGwneqjjrTVp7uT-bSP0hu4NJOqmMZtnW0sUQyW_Vyrx7bTusOtl3sd7Hb17MAAwGiC_1Oqx7RrM26ZwUiWgdBim7lXv7ARg0ewv6kNtSEZz4uW7WIRMpUxxuP2MtFCflyroW5z8s_bpJj5EgURr4J67bZwI7RxsTl_I"
            />
          </div>
        </div>
      </section>

      {/* Bottom Footer Section */}
      <footer className="mt-20 flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-t-3xl tonal-shift-bg">
        <div className="flex flex-col mb-4 md:mb-0">
          <span className="font-manrope font-bold text-slate-900 dark:text-white">Mutant-AI</span>
          <span className="font-inter text-xs text-slate-500">© 2024 Mutant-AI. The Ethereal Archivist.</span>
        </div>
        <div className="flex gap-8">
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity duration-200" href="#">
            Documentation
          </a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity duration-200" href="#">
            Privacy
          </a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity duration-200" href="#">
            Twitter
          </a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity duration-200" href="#">
            LinkedIn
          </a>
        </div>
      </footer>
    </main>
  );
};

export default AnalyticsPage;
