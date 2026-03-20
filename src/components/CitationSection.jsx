const CitationSection = () => {
  return (
    <section className="py-32 bg-surface-container-low px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          {/* The Citation Interaction */}
          <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
            <div className="mb-10">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4">
                <span className="material-symbols-outlined text-sm" data-icon="verified">
                  verified
                </span>
                Verifiable Intelligence
              </div>
              <h2 className="text-4xl font-headline font-bold mb-6">Trust, but Verify.</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Unlike generic LLMs that hallucinate, Mutant-AI grounds every response in your actual documents. Hover over any claim to see the exact paragraph, speaker, or spreadsheet cell it was pulled from.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface rounded-lg flex items-center justify-between group cursor-pointer hover:bg-primary-fixed/30 transition-all">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary" data-icon="description">
                    description
                  </span>
                  <span className="font-medium">Annual_Strategy_2024.pdf</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity" data-icon="open_in_new">
                  open_in_new
                </span>
              </div>
              <div className="p-4 bg-surface rounded-lg flex items-center justify-between group cursor-pointer hover:bg-primary-fixed/30 transition-all">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-tertiary" data-icon="mic">
                    mic
                  </span>
                  <span className="font-medium">All_Hands_Meeting_Transcript.vtt</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity" data-icon="open_in_new">
                  open_in_new
                </span>
              </div>
            </div>
          </div>
          {/* Visual Side */}
          <div className="lg:w-1/2 bg-mutant-gradient p-12 relative flex items-center justify-center min-h-[400px]">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            ></div>
            <div className="relative w-full max-w-sm">
              <div className="bg-white p-6 rounded-lg shadow-2xl transform -rotate-3 mb-6 relative z-10">
                <div className="h-2 w-24 bg-slate-200 rounded mb-4"></div>
                <div className="h-2 w-full bg-slate-100 rounded mb-2"></div>
                <div className="h-2 w-5/6 bg-slate-100 rounded mb-2"></div>
                <div className="h-2 w-4/6 bg-primary-fixed rounded mb-2"></div>
                <div className="mt-4 flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20"></div>
                  <div className="h-6 w-20 rounded bg-primary/10"></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-2xl transform rotate-6 absolute top-10 left-10 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs text-tertiary" data-icon="link">
                      link
                    </span>
                  </div>
                  <div className="h-3 w-32 bg-slate-200 rounded"></div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  "Projected ROI for the automated pipeline is expected to reach 14% by end of fiscal year."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CitationSection;
