const FeaturesSection = () => {
  return (
    <section className="py-32 px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-headline font-bold mb-4">Engineered for Accuracy</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Mutant-AI isn't just another chatbot. It's a precision instrument for your enterprise data.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto lg:h-[600px]">
          {/* Feature 1 */}
          <div className="md:col-span-8 bg-surface-container-lowest p-10 rounded-lg flex flex-col justify-between group hover:bg-surface-bright transition-all">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="chat_bubble">
                  chat_bubble
                </span>
              </div>
              <h3 className="text-3xl font-headline font-bold mb-4">Chat AI</h3>
              <p className="text-on-surface-variant text-lg max-w-md">
                Conversational interface that understands context, maintains state, and provides natural language answers from your secure knowledge base.
              </p>
            </div>
            <div className="mt-8 flex gap-4 overflow-x-auto no-scrollbar py-2">
              <span className="bg-surface-container px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium">Internal Policies</span>
              <span className="bg-surface-container px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium">Employee Handbooks</span>
              <span className="bg-surface-container px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium">Compliance Docs</span>
            </div>
          </div>
          {/* Feature 2 */}
          <div className="md:col-span-4 bg-surface-container-low p-10 rounded-lg flex flex-col items-center text-center justify-center">
            <div className="w-16 h-16 bg-secondary-fixed rounded-full flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-secondary text-4xl" data-icon="description">
                description
              </span>
            </div>
            <h3 className="text-2xl font-headline font-bold mb-4">Doc Search</h3>
            <p className="text-on-surface-variant">Instant indexing of PDFs, Excel, and PPTs with vector-based semantic retrieval.</p>
          </div>
          {/* Feature 3 */}
          <div className="md:col-span-4 bg-surface-container-low p-10 rounded-lg flex flex-col items-center text-center justify-center">
            <div className="w-16 h-16 bg-tertiary-fixed rounded-full flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-tertiary text-4xl" data-icon="groups">
                groups
              </span>
            </div>
            <h3 className="text-2xl font-headline font-bold mb-4">Meeting Intel</h3>
            <p className="text-on-surface-variant">Summarize transcripts and extract action items from your team's syncs automatically.</p>
          </div>
          {/* Feature 4 */}
          <div className="md:col-span-8 bg-mutant-gradient p-10 rounded-lg text-white flex items-center justify-between">
            <div className="max-w-md">
              <h3 className="text-3xl font-headline font-bold mb-4">Zero Trust Security</h3>
              <p className="text-white/80 text-lg">Your data never trains public models. Enterprise-grade encryption and RBAC come standard.</p>
            </div>
            <div className="hidden lg:block">
              <span className="material-symbols-outlined text-[120px] opacity-20" data-icon="encrypted">
                encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
