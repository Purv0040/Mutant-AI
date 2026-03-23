import { useEffect, useState } from 'react'
import FileTable from '../components/FileTable'
import UploadRequestModal from '../components/UploadRequestModal'
import { categorizeDoc, getDocuments, uploadDocument } from '../api'

const categoryStyle = {
  Finance: 'bg-green-100 text-green-800',
  HR: 'bg-blue-100 text-blue-800',
  Management: 'bg-amber-100 text-amber-800',
  Legal: 'bg-pink-100 text-pink-800',
  IT: 'bg-purple-100 text-purple-800',
}

function normalizeType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (ext === 'pdf') return 'PDF'
  if (ext === 'doc' || ext === 'docx') return 'DOCX'
  if (ext === 'ppt' || ext === 'pptx') return 'PPT'
  if (ext === 'xls' || ext === 'xlsx') return 'XLSX'
  if (ext === 'csv') return 'CSV'

  return (ext || 'FILE').toUpperCase()
}

function normalizeAccessMode(accessMode) {
  const raw = String(accessMode || '').trim()
  if (!raw) return 'For All'

  const lower = raw.toLowerCase()
  if (lower === 'all' || lower === 'all departments' || lower === 'for all') {
    return 'For All'
  }

  return raw
}

function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getAccessGroupTheme(groupName) {
  const key = String(groupName || '').toLowerCase()

  if (key === 'for all') {
    return {
      wrapper: 'border-l-indigo-500 bg-indigo-50/35',
      header: 'bg-indigo-100/70',
      title: 'text-indigo-900',
      badge: 'bg-indigo-600/10 text-indigo-700',
    }
  }

  if (key === 'engineering') {
    return {
      wrapper: 'border-l-emerald-500 bg-emerald-50/35',
      header: 'bg-emerald-100/70',
      title: 'text-emerald-900',
      badge: 'bg-emerald-600/10 text-emerald-700',
    }
  }

  if (key === 'hr') {
    return {
      wrapper: 'border-l-sky-500 bg-sky-50/35',
      header: 'bg-sky-100/70',
      title: 'text-sky-900',
      badge: 'bg-sky-600/10 text-sky-700',
    }
  }

  if (key === 'legal') {
    return {
      wrapper: 'border-l-rose-500 bg-rose-50/35',
      header: 'bg-rose-100/70',
      title: 'text-rose-900',
      badge: 'bg-rose-600/10 text-rose-700',
    }
  }

  if (key === 'finance') {
    return {
      wrapper: 'border-l-amber-500 bg-amber-50/35',
      header: 'bg-amber-100/70',
      title: 'text-amber-900',
      badge: 'bg-amber-600/10 text-amber-800',
    }
  }

  return {
    wrapper: 'border-l-violet-500 bg-violet-50/35',
    header: 'bg-violet-100/70',
    title: 'text-violet-900',
    badge: 'bg-violet-600/10 text-violet-700',
  }
}

export default function Categorization() {
  const [rows, setRows] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchRows = async () => {
    setLoading(true)
    setError('')
    try {
      const docs = await getDocuments()
      const mapped = docs.map((doc) => ({
        name: doc.filename,
        type: normalizeType(doc.filename),
        category: doc.category || 'Management',
        accessMode: normalizeAccessMode(doc.accessMode || doc.access_mode || 'For All'),
        tags: ['Status: ' + (doc.status || 'uploaded'), ...(doc.extracted_fields || [])],
        confidence: doc.category ? 90 : 0,
        uploadedAt: doc.uploaded_at || doc.created_at || doc.updated_at || null,
        dateLabel: formatDate(doc.uploaded_at || doc.created_at || doc.updated_at),
      }))
      setRows(mapped)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
  }, [])

  const handleModalSubmit = async (data) => {
    const { file, accessMode } = data
    setIsModalOpen(false)

    setUploading(true)
    setUploadProgress(0)
    setError('')
    try {
      const uploaded = await uploadDocument(file, {
        onProgress: (percent) => setUploadProgress(percent),
        accessMode: accessMode
      })
      
      const categorized = await categorizeDoc(uploaded.filename)
      await fetchRows()

      setRows((prev) => {
        const next = [...prev]
        const idx = next.findIndex((row) => row.name === uploaded.filename)
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            category: categorized.category || next[idx].category,
            tags: categorized.extracted_fields ? ['Status: indexed', ...categorized.extracted_fields] : next[idx].tags,
            confidence: Math.round((categorized.confidence || 0.8) * 100),
          }
        }
        return next
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const docNameSuggestions = Array.from(new Set(rows.map((row) => row.name))).filter((name) =>
    normalizedQuery ? name.toLowerCase().includes(normalizedQuery) : false
  )
  const visibleSuggestions = docNameSuggestions.slice(0, 6)

  const filteredRows = rows.filter((row) => {
    if (!normalizedQuery) return true
    const searchable = [
      row.name,
      row.type,
      row.category,
      row.accessMode,
      row.dateLabel,
      ...(row.tags || []),
    ]
      .join(' ')
      .toLowerCase()
    return searchable.includes(normalizedQuery)
  })

  const groupedRows = filteredRows.reduce((acc, row) => {
    const key = normalizeAccessMode(row.accessMode)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(row)
    return acc
  }, {})

  const orderedGroups = Object.entries(groupedRows).sort(([a], [b]) => {
    if (a === 'For All') return -1
    if (b === 'For All') return 1
    return a.localeCompare(b)
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
        <UploadRequestModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleModalSubmit} 
        />

        {/* Page header */}
        <div>
          <p className="text-[13px] text-on-surface-variant">
            AI reads every uploaded file and assigns category + extracts key fields
          </p>
          {uploading && (
            <p className="text-[13px] text-blue-700 mt-1">Uploading document: {uploadProgress}%</p>
          )}
        </div>

        {/* Upload panel */}
        <section className="w-full rounded-[30px] border-2 border-dashed border-outline-variant/50 bg-surface-container-lowest px-6 py-10 lg:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center shadow-[0_8px_20px_rgba(53,37,205,0.12)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 16V7" />
                <path d="m8.5 10.5 3.5-3.5 3.5 3.5" />
                <path d="M20.4 16.6A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.3" />
              </svg>
            </div>

            <h3 className="text-[34px] leading-tight font-headline font-extrabold text-on-surface tracking-tight">
              Upload your intelligence
            </h3>
            <p className="mt-2 text-[18px] text-on-surface-variant leading-relaxed">
              Drag and drop files here, or click to browse. We support PDF, Excel, and Powerpoint documents.
            </p>

            <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-mutant-gradient text-white text-[14px] font-semibold shadow-[0_10px_24px_rgba(53,37,205,0.30)] hover:opacity-95 transition-opacity"
              >
                Select Files
              </button>
              <button
                type="button"
                onClick={() => setError('Import from Drive will be available soon.')}
                className="px-6 py-2.5 rounded-full bg-primary/15 text-primary text-[14px] font-semibold hover:bg-primary/20 transition-colors"
              >
                Import from Drive
              </button>
            </div>
          </div>
        </section>

        {/* Grouped tables by access field */}
        <div className="space-y-4">
          <div className="bg-white ghost-border-solid rounded-card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-high space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold tracking-widest text-outline uppercase">
                  Recently processed · {filteredRows.length} of {rows.length} files
                </p>
              </div>

              <div className="relative max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by file, category, access mode, tag, or date..."
                  className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low text-[13px] text-on-surface placeholder:text-outline rounded-full border border-outline-variant/35 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}

                {!!visibleSuggestions.length && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-20 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl shadow-[0_10px_30px_rgba(19,27,46,0.08)] p-1.5">
                    {visibleSuggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setSearchQuery(name)}
                        className="w-full text-left px-3 py-2 rounded-xl text-[13px] text-on-surface hover:bg-surface-container transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading && <p className="text-[13px] text-on-surface-variant px-5 py-4">Loading files...</p>}

            {!loading && !rows.length && !error && (
              <p className="text-[13px] text-on-surface-variant px-5 py-4">No files found.</p>
            )}

            {!loading && !!rows.length && !filteredRows.length && !error && (
              <p className="text-[13px] text-on-surface-variant px-5 py-4">No documents match your search.</p>
            )}

            {!loading && orderedGroups.map(([groupName, groupData]) => {
              const theme = getAccessGroupTheme(groupName)

              return (
                <div
                  key={groupName}
                  className={`mx-4 my-4 rounded-2xl overflow-hidden border border-outline-variant/25 border-l-4 shadow-[0_10px_24px_rgba(19,27,46,0.04)] ${theme.wrapper}`}
                >
                  <div className={`px-5 py-3 flex items-center justify-between gap-3 ${theme.header}`}>
                    <p className={`text-[12px] font-semibold ${theme.title}`}>
                      {groupName}
                    </p>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${theme.badge}`}>
                      {groupData.length} file{groupData.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="bg-white/90">
                    <FileTable data={groupData} />
                  </div>
                </div>
              )
            })}

            {error && <p className="text-[12px] text-red-600 px-5 py-3">{error}</p>}
          </div>
        </div>

        {/* Category legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryStyle).map(([label, cls]) => (
            <span key={label} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${cls}`}>
              {label}
            </span>
          ))}
          <span className="text-[11px] text-outline self-center ml-1">Categories assigned by AI</span>
        </div>
      </div>
    </div>
  )
}
