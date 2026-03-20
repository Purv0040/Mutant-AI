const SearchPage = () => {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-surface h-full">
      {/* Global Search Bar Header */}
      <header className="p-6 bg-surface z-10">
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center bg-surface-container-low rounded-2xl p-2 pl-6 shadow-sm ring-1 ring-outline-variant/10 focus-within:ring-primary/30 transition-all">
            <span className="material-symbols-outlined text-primary text-2xl mr-4">search</span>
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-lg font-headline font-semibold text-on-surface placeholder:text-on-surface-variant/40"
              placeholder="Search across your intelligence workspace..."
              type="text"
              defaultValue="Q3 Market Analysis Strategy"
            />
            <button className="bg-primary text-white px-6 py-2 rounded-xl font-label text-xs font-bold tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2">
              <span>EXPLORE</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          {/* Filter Chips */}
          <div className="flex gap-3 mt-6">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              All Types
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              PDF Documents
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">folder</span>
              Marketing
            </button>
          </div>
        </div>
      </header>

      {/* Split View Explorer */}
      <div className="flex-1 flex min-h-0 px-6 pb-6 gap-6">
        {/* Left: Results List */}
        <section className="w-1/2 flex flex-col min-h-0 bg-surface-container-low rounded-lg p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-label font-bold tracking-widest text-primary uppercase">12 Matches Found</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">sort</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 chat-scrollbar">
            {/* Result Card 1 (Active) */}
            <div className="bg-surface-container-lowest p-6 rounded-lg border-l-4 border-primary shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">picture_as_pdf</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface">Q3_Strategy_Review_Final.pdf</h3>
                    <p className="text-[11px] text-on-surface-variant opacity-60">Modified 2h ago • 4.2 MB</p>
                  </div>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold uppercase tracking-tighter">
                  98% Match
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                ...the proposed <span className="bg-primary/10 text-primary font-semibold px-1 rounded">Market Analysis</span> shows a 14% growth in the EMEA region. We must align the <span className="bg-primary/10 text-primary font-semibold px-1 rounded">Q3 Strategy</span> with the upcoming fiscal redistribution...
              </p>
            </div>

            {/* Result Card 2 */}
            <div className="bg-surface-container-low hover:bg-surface-container-high p-6 rounded-lg transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">table_view</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Revenue_Projections_Q3.xlsx</h3>
                    <p className="text-[11px] text-on-surface-variant opacity-60">Modified Sep 14 • 1.1 MB</p>
                  </div>
                </div>
                <span className="text-[10px] bg-on-surface-variant/10 text-on-surface-variant px-2 py-1 rounded font-bold uppercase tracking-tighter">
                  82% Match
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant/70 leading-relaxed">
                ...column 'C' indicates the <span className="font-semibold text-on-surface">Market Analysis</span> variance across different verticals. This data directly feeds into the executive summary...
              </p>
            </div>

            {/* Result Card 3 */}
            <div className="bg-surface-container-low hover:bg-surface-container-high p-6 rounded-lg transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">slideshow</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Deck_V4_MutantAI.pptx</h3>
                    <p className="text-[11px] text-on-surface-variant opacity-60">Modified Aug 28 • 18 MB</p>
                  </div>
                </div>
                <span className="text-[10px] bg-on-surface-variant/10 text-on-surface-variant px-2 py-1 rounded font-bold uppercase tracking-tighter">
                  75% Match
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant/70 leading-relaxed">
                ...Slide 14: Visualizing the <span className="font-semibold text-on-surface">Strategy</span> shift from legacy pipelines to the new Intelligent Surface architecture...
              </p>
            </div>

            {/* Result Card 4 */}
            <div className="bg-surface-container-low hover:bg-surface-container-high p-6 rounded-lg transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Meeting_Notes_Aug.docx</h3>
                    <p className="text-[11px] text-on-surface-variant opacity-60">Modified Aug 12 • 45 KB</p>
                  </div>
                </div>
                <span className="text-[10px] bg-on-surface-variant/10 text-on-surface-variant px-2 py-1 rounded font-bold uppercase tracking-tighter">
                  61% Match
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant/70 leading-relaxed">
                ...Sarah mentioned that the <span className="font-semibold text-on-surface">Market Analysis</span> was still pending peer review for the EMEA sector...
              </p>
            </div>
          </div>
        </section>

        {/* Right: Document Preview Panel */}
        <section className="w-1/2 flex flex-col min-h-0 bg-surface-container-highest rounded-lg overflow-hidden relative border-t border-r border-b border-outline-variant/5">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between p-4 bg-surface-container-highest/80 backdrop-blur-md sticky top-0 border-b border-outline-variant/10 z-10">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">description</span>
              <span className="font-headline font-bold text-sm truncate max-w-[200px]">Q3_Strategy_Review_Final.pdf</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">zoom_in</span>
              </button>
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">download</span>
              </button>
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">open_in_new</span>
              </button>
            </div>
          </div>

          {/* PDF Mock Content */}
          <div className="flex-1 overflow-y-auto p-12 bg-white flex flex-col items-center chat-scrollbar relative">
            <div className="w-full max-w-xl bg-white shadow-2xl p-16 min-h-[800px] border border-slate-100 rounded-sm">
              <div className="flex justify-between items-start mb-16">
                <div className="w-16 h-2 bg-primary/20 rounded-full"></div>
                <span className="text-[10px] font-label font-bold text-on-surface-variant/30 uppercase">Page 1 of 42</span>
              </div>
              <h1 className="text-3xl font-headline font-extrabold mb-8 text-on-surface tracking-tight leading-tight">
                Q3 Strategic Market Analysis and Future Growth Projections
              </h1>
              <div className="space-y-6 mb-12">
                <div className="h-4 w-full bg-surface-container-low rounded-sm"></div>
                <div className="h-4 w-5/6 bg-surface-container-low rounded-sm"></div>
                <div className="h-4 w-4/6 bg-surface-container-low rounded-sm"></div>
              </div>
              <div className="bg-primary/5 p-8 rounded-lg mb-12 border-l-4 border-primary">
                <h4 className="font-headline font-bold text-primary mb-4 text-sm">Key Highlight: EMEA Sector</h4>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  The <span className="bg-primary/20 font-bold px-1 text-primary">Market Analysis</span> indicates that the EMEA region is poised for significant digital transformation. Our <span className="bg-primary/20 font-bold px-1 text-primary">Q3 Strategy</span> must prioritize cloud-native implementations to maintain competitive velocity against emerging local startups.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="aspect-video bg-surface-container-highest rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    className="w-full h-full object-cover opacity-50 mix-blend-multiply"
                    data-alt="Abstract analytical data chart visualization"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG8WceQFkbSsEYaFO7IwOXv7RUkMHP-SBUhfRVtQrZmmH5HyZECHyKUY1AYsaH55M6Vs_JGwDXZqXqSN11vAWNaAy-LVEZX_USZWy6omvERl7zYhYtyzhy7pwwjHHWnCJKMHjAT0Yuzn5EnHQbgb4chp4Od5UQnGNbjSjKgBs7kGDhhX2zfxWMnKG7KeSmMLQzrpnC23hwcy5xDHPSC5hdM9VuIS84Lp3p0W1tRXF1GQ9Fm2uMq-qhE5gq2fFun7vNtaCBYJob5B4"
                  />
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <div className="h-3 w-full bg-surface-container-low rounded-sm"></div>
                  <div className="h-3 w-2/3 bg-surface-container-low rounded-sm"></div>
                  <div className="h-3 w-3/4 bg-surface-container-low rounded-sm"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-4 w-full bg-surface-container-low rounded-sm"></div>
                <div className="h-4 w-full bg-surface-container-low rounded-sm"></div>
                <div className="h-4 w-4/5 bg-surface-container-low rounded-sm"></div>
              </div>
            </div>

            {/* AI Context Summary Overlay - Moved into the nearest relative container to scroll/be sticky if needed, actually HTML has absolute to section */}
          </div>
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center gap-4 border border-white/20">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-white">auto_awesome</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-label font-bold uppercase tracking-widest opacity-80">AI Summary</p>
              <p className="text-xs font-medium truncate">Mutant-AI extracted 3 key action items from this section regarding EMEA growth...</p>
            </div>
            <button className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all">
              VIEW INSIGHTS
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SearchPage;
