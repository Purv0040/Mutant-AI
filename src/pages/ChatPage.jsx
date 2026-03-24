const ChatPage = () => {
  return (
    <main className="flex-1 flex flex-col relative bg-surface overflow-hidden min-h-screen">
      {/* TOP BAR (Anchor: TopNavBar Style) */}
      <header className="flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md z-30 sticky top-0">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold font-headline tracking-tight text-primary">Intelligent Chat</span>
          <div className="h-4 w-px bg-outline-variant/30"></div>
          <span className="text-xs font-label text-on-surface-variant font-semibold tracking-widest uppercase">
            Model: Mutant-v2.5-Ultra
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
        </div>
      </header>
      {/* CHAT CANVAS */}
      <div className="flex-1 overflow-y-auto chat-scrollbar p-8 space-y-12 max-w-5xl mx-auto w-full pb-32">
        {/* USER MESSAGE */}
        <div className="flex flex-col items-end w-full">
          <div className="max-w-[80%] bg-primary-container text-on-primary rounded-2xl rounded-br-sm px-6 py-4 shadow-lg shadow-primary/10">
            <p className="body-md leading-relaxed">
              Can you analyze the key findings from the Q3 internal wiki and summarize the impact on our current project
              timelines?
            </p>
          </div>
          <span className="mt-2 text-[10px] font-label font-bold text-on-surface-variant/40 uppercase tracking-widest px-2">
            10:42 AM • Sent
          </span>
        </div>
        {/* AI RESPONSE */}
        <div className="flex flex-col items-start w-full">
          <div className="flex items-start gap-4 w-full">
            <div className="w-8 h-8 mt-1 rounded-lg bg-tertiary-container flex items-center justify-center text-white flex-shrink-0">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <div className="flex-1 space-y-6">
              {/* Response Container */}
              <div className="bg-surface-container-highest rounded-2xl p-8 shadow-sm">
                {/* Editorial Summary */}
                <h2 className="font-headline text-2xl font-bold tracking-tight text-primary mb-4">
                  Strategic Timeline Adjustment Required
                </h2>
                {/* Markdown content */}
                <div className="space-y-4 text-on-surface leading-relaxed font-body">
                  <p>
                    Based on the **Q3 Strategy Report** and the **Engineering Wiki**, there are three primary findings that will
                    impact our current roadmap:
                  </p>
                  <ul className="space-y-3 list-none">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2 flex-shrink-0"></span>
                      <span>
                        <strong>Infrastructure Migration:</strong> The migration to the new vector database is taking 15% longer
                        than anticipated due to data sanitization protocols.{' '}
                        <span className="text-xs font-semibold text-primary px-1.5 py-0.5 bg-primary/10 rounded">
                          Source: Internal_Wiki.pdf, Page 4
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2 flex-shrink-0"></span>
                      <span>
                        <strong>Resource Allocation:</strong> The UX team has been partially diverted to the 'Mutant Mobile' project,
                        creating a bottleneck for the Desktop web interface.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2 flex-shrink-0"></span>
                      <span>
                        <strong>Market Shift:</strong> Emerging competitor features in the real-time collaboration space suggest we
                        should accelerate our 'Shared Canvas' release.{' '}
                        <span className="text-xs font-semibold text-primary px-1.5 py-0.5 bg-primary/10 rounded">
                          Source: Q3_Market_Analysis.docx, Page 12
                        </span>
                      </span>
                    </li>
                  </ul>
                  <p className="pt-2">
                    I recommend shifting the v2.5 release date by **10 business days** to ensure the core intelligence engine is
                    fully optimized.
                  </p>
                </div>
                {/* Citation Mini-Cards */}
                <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-lg">description</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface truncate max-w-[120px]">Internal_Wiki.pdf</span>
                      <span className="text-[10px] text-on-surface-variant/60">Reference: Page 4</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant/40 group-hover:text-primary transition-colors">
                      open_in_new
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-lg">article</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface truncate max-w-[120px]">Q3_Market_Analysis.docx</span>
                      <span className="text-[10px] text-on-surface-variant/60">Reference: Page 12</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant/40 group-hover:text-primary transition-colors">
                      open_in_new
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-label font-bold text-on-surface-variant/40 uppercase tracking-widest px-2">
                Mutant-AI • Response Generated in 1.4s
              </span>
            </div>
          </div>
        </div>
        {/* USER MESSAGE 2 */}
        <div className="flex flex-col items-end w-full">
          <div className="max-w-[80%] bg-primary-container text-on-primary rounded-2xl rounded-br-sm px-6 py-4 shadow-lg shadow-primary/10">
            <p className="body-md leading-relaxed">Show me the specific section on infrastructure migration from that PDF.</p>
          </div>
          <span className="mt-2 text-[10px] font-label font-bold text-on-surface-variant/40 uppercase tracking-widest px-2">
            10:45 AM • Sent
          </span>
        </div>
      </div>
      {/* INPUT AREA */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-surface via-surface to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">
          <div className="relative group">
            {/* Input Background Glass */}
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-primary/5 transition-all duration-300 group-focus-within:ring-2 ring-primary/20"></div>
            {/* Input Field Content */}
            <div className="relative flex items-end p-4 gap-2">
              <button className="p-2 text-on-surface-variant/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <textarea
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 py-2 resize-none max-h-40 font-body text-sm leading-relaxed"
                placeholder="Ask Mutant anything about your documents..."
                rows={1}
              ></textarea>
              <div className="flex items-center gap-2">
                <button className="p-2 text-on-surface-variant/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    send
                  </span>
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-center mt-3 text-on-surface-variant/40 font-label tracking-widest uppercase">
            Mutant-AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ChatPage;
