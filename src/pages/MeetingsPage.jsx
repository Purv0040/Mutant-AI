const MeetingsPage = () => {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-surface">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 sticky top-0 bg-white/70 backdrop-blur-md z-30">
        <div>
          <h2 className="text-2xl font-black text-indigo-600 font-headline tracking-tight">Q4 Roadmap Alignment</h2>
          <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-sm">calendar_today</span> Oct 24, 2024 • 45 mins
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-5 py-2.5 rounded-full bg-surface-container-highest text-primary font-semibold text-sm hover:bg-surface-container-high transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">upload_file</span> Upload Recording
          </button>
          <button className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">mic</span> Record Live
          </button>
        </div>
      </header>
      {/* Timeline Bar Section */}
      <section className="px-8 mt-2 mb-8">
        <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Meeting Timeline</h3>
            <span className="text-xs font-medium text-primary">Live Sync Active</span>
          </div>
          <div className="h-3 w-full bg-surface-container-highest rounded-full flex overflow-hidden relative">
            <div className="h-full bg-primary w-[15%] border-r border-surface" title="Introduction"></div>
            <div className="h-full bg-secondary-container w-[40%] border-r border-surface" title="Feature Deep Dive"></div>
            <div className="h-full bg-tertiary-container w-[25%] border-r border-surface" title="Resource Allocation"></div>
            <div className="h-full bg-outline-variant/30 w-[20%]" title="Conclusion"></div>
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-medium text-on-surface-variant/60">
            <div className="flex flex-col gap-1">
              <span className="w-2 h-2 rounded-full bg-primary mb-1"></span>
              <span>00:00 - Intro</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary-container mb-1"></span>
              <span>06:45 - Product Alpha</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary-container mb-1"></span>
              <span>24:20 - Budget</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="w-2 h-2 rounded-full bg-outline-variant/30 mb-1"></span>
              <span>38:10 - Wrap up</span>
            </div>
          </div>
        </div>
      </section>
      {/* Bento Grid Layout */}
      <div className="px-8 pb-12 grid grid-cols-12 gap-6 items-start">
        {/* Left Column: Transcript Viewer */}
        <section className="col-span-7 flex flex-col gap-4">
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-headline">Smart Transcript</h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant">
                  <span className="material-symbols-outlined">search</span>
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 space-y-8 chat-scrollbar">
              {/* Speaker block */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-xs">
                  SM
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">Sarah Miller</span>
                    <span className="text-[10px] text-on-surface-variant/50 font-label">10:02 AM</span>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface/80">
                    Alright team, let's start with the Q4 vision. We're looking at a 15% increase in throughput for the Mutant
                    engine. Does the infrastructure team have the bandwidth for this?
                  </p>
                </div>
              </div>
              {/* Speaker block */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-tertiary text-xs">
                  JD
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">James Dovas</span>
                    <span className="text-[10px] text-on-surface-variant/50 font-label">10:04 AM</span>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface/80">
                    We can handle the scaling, but we'll need to migrate the vector database to the dedicated clusters first. If
                    we do that by week 2, we're solid.
                  </p>
                </div>
              </div>
              {/* Highlighted AI segment */}
              <div className="flex gap-4 bg-primary/5 p-4 rounded-xl -mx-4 border-l-4 border-primary">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-primary">Mutant Insights</span>
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                      CRITICAL DECISION
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed italic text-indigo-900/70">
                    Sarah Miller confirmed the 15% throughput target dependent on James's database migration scheduled for Week 2.
                  </p>
                </div>
              </div>
              {/* Speaker block */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-xs">
                  SM
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">Sarah Miller</span>
                    <span className="text-[10px] text-on-surface-variant/50 font-label">10:08 AM</span>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface/80">
                    Perfect. Let's get the tickets created for that. Elena, can you handle the documentation for the new API
                    endpoints while James works on the cluster?
                  </p>
                </div>
              </div>
              {/* Speaker block */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant text-xs">
                  EW
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">Elena Wright</span>
                    <span className="text-[10px] text-on-surface-variant/50 font-label">10:10 AM</span>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface/80">
                    Yes, I'll start the drafts this afternoon. We should have the technical specs ready for review by Thursday
                    EOD.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Right Column: AI Summary & Actions */}
        <aside className="col-span-5 flex flex-col gap-6">
          {/* AI Summary Card */}
          <div className="bg-primary-container p-8 rounded-lg text-on-primary shadow-xl shadow-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-center gap-3 mb-6 relative">
              <span className="material-symbols-outlined">auto_graph</span>
              <h3 className="text-lg font-bold font-headline">Executive Summary</h3>
            </div>
            <p className="text-lg font-headline font-semibold leading-snug mb-4 relative">
              The team aligned on a 15% performance increase for Q4, contingent on a critical vector database migration in week 2.
            </p>
            <div className="space-y-3 opacity-90 text-sm relative">
              <p>• Infrastructure migration is the primary bottleneck.</p>
              <p>• Documentation for new APIs will be finalized by Thursday.</p>
              <p>• Stakeholder review meeting scheduled for next Monday.</p>
            </div>
          </div>
          {/* Action Items Checklist */}
          <div className="bg-surface-container p-8 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">task_alt</span>
                <h3 className="text-lg font-bold font-headline">Action Items</h3>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-white rounded-md text-primary">3 Tasks</span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 p-4 bg-surface-container-lowest rounded-xl group hover:shadow-md transition-all">
                <div className="mt-1 w-5 h-5 rounded border-2 border-primary/20 flex items-center justify-center hover:border-primary cursor-pointer transition-colors"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Migrate Vector DB to clusters</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded">JAMES D.</span>
                    <span className="text-[10px] text-on-surface-variant font-medium">Due: Nov 2</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 bg-surface-container-lowest rounded-xl group hover:shadow-md transition-all">
                <div className="mt-1 w-5 h-5 rounded border-2 border-primary/20 flex items-center justify-center hover:border-primary cursor-pointer transition-colors"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Draft Technical API Specs</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold text-secondary bg-secondary-fixed px-2 py-0.5 rounded">ELENA W.</span>
                    <span className="text-[10px] text-on-surface-variant font-medium">Due: Oct 27</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 bg-surface-container-lowest rounded-xl group hover:shadow-md transition-all">
                <div className="mt-1 w-5 h-5 rounded border-2 border-primary/20 flex items-center justify-center hover:border-primary cursor-pointer transition-colors"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Initiate Q4 Jira Epics</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded">SARAH M.</span>
                    <span className="text-[10px] text-on-surface-variant font-medium">Due: Oct 25</span>
                  </div>
                </div>
              </li>
            </ul>
            <button className="w-full mt-6 py-3 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant text-sm font-medium hover:bg-white transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span> Add Custom Task
            </button>
          </div>
          {/* Knowledge Fragments */}
          <div className="bg-surface-bright p-6 rounded-lg border-l-4 border-tertiary-container">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-tertiary text-lg">lightbulb</span>
              <h4 className="text-sm font-bold text-tertiary uppercase tracking-wider font-label">Contextual Insight</h4>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Last quarter's migration resulted in a <span className="font-bold text-on-surface">12% latency drop</span>. Mutant-AI suggests checking if the same cluster configuration is applicable here.
            </p>
          </div>
        </aside>
      </div>
      {/* Footer Anchor */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 tonal-shift-bg mt-auto">
        <div className="mb-4 md:mb-0">
          <span className="font-manrope font-bold text-slate-900 dark:text-white mr-4">Mutant-AI</span>
          <span className="font-inter text-xs text-slate-500">© 2024 Mutant-AI. The Ethereal Archivist.</span>
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
        </div>
      </footer>
      {/* Contextual FAB (Only on relevant pages) */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="group flex items-center gap-3 bg-indigo-600 text-white pl-4 pr-6 py-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all scale-100 active:scale-90">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            add_circle
          </span>
          <span className="font-bold text-sm">Schedule Follow-up</span>
        </button>
      </div>
    </main>
  );
};

export default MeetingsPage;
