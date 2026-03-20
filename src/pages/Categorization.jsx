import TopBar from '../components/TopBar'
import FileTable from '../components/FileTable'

export default function Categorization() {
  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Auto-Categorization"
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 bg-primary text-white text-[13px] font-medium rounded-btn hover:bg-accent transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Upload Files
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
        {/* Page header */}
        <div>
          <p className="text-[13px] text-on-surface-variant">
            AI reads every uploaded file and assigns category + extracts key fields
          </p>
        </div>

        {/* Drop zone */}
        <div className="border-2 border-dashed border-outline-variant rounded-card p-10 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group">
          <div className="flex justify-center mb-3 text-on-surface-variant group-hover:text-accent transition-colors">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-on-surface">Drop files here to categorize</p>
          <p className="text-[13px] text-outline mt-1">or click to browse · PDF, XLSX, PPT supported</p>
        </div>

        {/* Table section */}
        <div className="bg-white ghost-border-solid rounded-card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-high">
            <p className="text-[11px] font-semibold tracking-widest text-outline uppercase">
              Recently processed · 5 files
            </p>
          </div>
          <FileTable />
        </div>

        {/* Category legend */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Finance', cls: 'bg-green-100 text-green-800' },
            { label: 'HR', cls: 'bg-blue-100 text-blue-800' },
            { label: 'Management', cls: 'bg-amber-100 text-amber-800' },
            { label: 'Legal', cls: 'bg-pink-100 text-pink-800' },
            { label: 'IT / Infra', cls: 'bg-purple-100 text-purple-800' },
          ].map((c) => (
            <span key={c.label} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.cls}`}>
              {c.label}
            </span>
          ))}
          <span className="text-[11px] text-outline self-center ml-1">Categories assigned by AI</span>
        </div>
      </div>
    </div>
  )
}
