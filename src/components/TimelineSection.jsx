const TimelineSection = () => {
  return (
    <section className="py-32 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/3">
            <h2 className="text-5xl font-headline font-extrabold tracking-tight mb-6">
              From Fragmented Data to Intelligence.
            </h2>
            <p className="text-on-surface-variant text-lg">
              Deploy Mutant-AI in minutes and transform how your team accesses information.
            </p>
          </div>
          <div className="w-full md:w-2/3 space-y-12">
            <div className="flex gap-8 group">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary bg-background flex items-center justify-center text-primary font-bold shrink-0">
                  1
                </div>
                <div className="w-1 h-full bg-surface-container-high group-last:bg-transparent"></div>
              </div>
              <div className="pb-12">
                <h4 className="text-2xl font-headline font-bold mb-2">Connect Sources</h4>
                <p className="text-on-surface-variant">
                  Sync your Google Drive, SharePoint, Slack, and local file storage with a single click.
                </p>
              </div>
            </div>
            <div className="flex gap-8 group">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary bg-background flex items-center justify-center text-primary font-bold shrink-0">
                  2
                </div>
                <div className="w-1 h-full bg-surface-container-high group-last:bg-transparent"></div>
              </div>
              <div className="pb-12">
                <h4 className="text-2xl font-headline font-bold mb-2">Automatic Indexing</h4>
                <p className="text-on-surface-variant">
                  Our RAG engine processes and vectors your content, creating a private knowledge map of your entire company.
                </p>
              </div>
            </div>
            <div className="flex gap-8 group">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary bg-background flex items-center justify-center text-primary font-bold shrink-0">
                  3
                </div>
                <div className="w-1 h-full bg-transparent"></div>
              </div>
              <div className="">
                <h4 className="text-2xl font-headline font-bold mb-2">Query and Create</h4>
                <p className="text-on-surface-variant">
                  Ask questions in natural language and receive high-fidelity answers with direct citations to original sources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
