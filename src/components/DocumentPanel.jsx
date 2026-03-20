const files = [
  {
    name: 'HR_Policy.pdf',
    type: 'PDF',
    pages: '12 pages',
  },
  {
    name: 'Employee_Handbook.pdf',
    type: 'PDF',
    pages: '45 pages',
  },
  {
    name: 'Financials_Q3.xlsx',
    type: 'XLSX',
    pages: '8 sheets',
  },
  {
    name: 'Company_Roadmap.pptx',
    type: 'PPT',
    pages: '22 slides',
  },
]

const typeStyle = {
  PDF: { badge: 'bg-red-100 text-red-700', icon: '📄' },
  XLSX: { badge: 'bg-green-100 text-green-700', icon: '📊' },
  PPT: { badge: 'bg-amber-100 text-amber-700', icon: '📋' },
}

export default function DocumentPanel() {
  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-surface-low border-l border-surface-high flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-surface-high flex items-center justify-between">
        <span className="font-semibold text-[14px] text-on-surface">Documents</span>
        <span className="bg-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {files.length}
        </span>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {files.map((file) => {
          const style = typeStyle[file.type]
          return (
            <div
              key={file.name}
              className="flex items-start gap-2.5 px-2 py-2.5 rounded-btn hover:bg-surface-container transition-all cursor-pointer group"
            >
              <span className="text-lg mt-0.5">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-on-surface truncate group-hover:text-primary">
                  {file.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}>
                    {file.type}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">{file.pages}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Drop zone */}
      <div className="p-3">
        <div className="border border-dashed border-outline-variant rounded-card p-4 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer">
          <div className="flex justify-center mb-2 text-on-surface-variant">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          <p className="text-[11px] font-medium text-on-surface-variant">Drop files here</p>
          <p className="text-[10px] text-outline mt-0.5">PDF, XLSX, PPT</p>
        </div>
      </div>
    </aside>
  )
}
