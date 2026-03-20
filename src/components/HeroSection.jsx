import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative px-8 pt-20 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="z-10">
          <span className="bg-primary-fixed text-on-primary-fixed-variant px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 inline-block">
            Enterprise Intelligence
          </span>
          <h1 className="text-7xl font-headline font-extrabold tracking-tighter text-on-surface leading-[1.05] mb-8">
            Ask Your Company Knowledge <span className="text-primary italic">Instantly</span>.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
            The ultimate RAG-powered AI assistant for teams. Query PDFs, Excel, and PPTs with pinpoint citations and meeting intelligence.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="bg-mutant-gradient text-white px-8 py-4 rounded-xl font-headline font-bold text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform"
            >
              Get Started
            </Link>
            <Link
              to="/features"
              className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-headline font-bold text-lg hover:bg-surface-container-high transition-colors"
            >
              Try Demo
            </Link>
          </div>
        </div>
        {/* Abstract Visual Representation */}
        <div className="relative">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
          <div className="bg-surface-container-low rounded-xl p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <div className="w-3 h-3 rounded-full bg-tertiary"></div>
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary-fixed shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-primary" data-icon="person">
                    person
                  </span>
                </div>
                <div className="bg-primary-container text-white p-4 rounded-xl rounded-br-sm text-sm">
                  What was the revenue growth mentioned in the Q3 board meeting?
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-tertiary" data-icon="auto_awesome">
                    auto_awesome
                  </span>
                </div>
                <div className="bg-surface-container-highest p-5 rounded-xl text-sm space-y-3">
                  <p className="font-headline font-bold text-lg leading-tight">Q3 revenue grew by 24% year-over-year.</p>
                  <p className="text-on-surface-variant">
                    The growth was primarily driven by the new Cloud-Edge product line and expansion in the EMEA market.
                  </p>
                  <div className="flex gap-2 pt-2 border-t border-outline-variant/20">
                    <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">
                      Ref: Q3_Board_Deck.pdf
                    </span>
                    <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">
                      Ref: Sales_Report_Sept.xlsx
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
