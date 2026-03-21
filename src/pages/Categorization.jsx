import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import FileTable from '../components/FileTable'
import { categorizeDoc, getDocuments, uploadDocument } from '../api'

const categoryStyle = {
  Finance: 'bg-green-100 text-green-800',
  HR: 'bg-blue-100 text-blue-800',
  Management: 'bg-amber-100 text-amber-800',
  Legal: 'bg-pink-100 text-pink-800',
  IT: 'bg-purple-100 text-purple-800',
}

function normalizeType(filename) {
  const ext = filename.split('.').pop()?.toUpperCase()
  if (ext === 'PPTX') return 'PPT'
  if (ext === 'XLSX') return 'XLSX'
  return 'PDF'
}

export default function Categorization() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const fetchRows = async () => {
    setLoading(true)
    setError('')
    try {
      const docs = await getDocuments()
      const mapped = docs.map((doc) => ({
        name: doc.filename,
        type: normalizeType(doc.filename),
        category: doc.category || 'Management',
        tags: ['Status: ' + (doc.status || 'uploaded')],
        confidence: doc.category ? 90 : 0,
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

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const uploaded = await uploadDocument(file)
      const categorized = await categorizeDoc(uploaded.filename)
      await fetchRows()

      setRows((prev) => {
        const next = [...prev]
        const idx = next.findIndex((row) => row.name === uploaded.filename)
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            category: categorized.category || next[idx].category,
            tags: categorized.extracted_fields?.length ? categorized.extracted_fields : next[idx].tags,
            confidence: Math.round((categorized.confidence || 0.8) * 100),
          }
        }
        return next
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Auto-Categorization"
        actions={
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 bg-primary text-white text-[13px] font-medium rounded-btn hover:bg-accent transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.pptx,.xlsx"
          onChange={handleUpload}
        />

        {/* Page header */}
        <div>
          <p className="text-[13px] text-on-surface-variant">
            AI reads every uploaded file and assigns category + extracts key fields
          </p>
        </div>

        {/* Drop zone */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-outline-variant rounded-card p-10 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
        >
          <div className="flex justify-center mb-3 text-on-surface-variant group-hover:text-accent transition-colors">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-on-surface">Drop files here to categorize</p>
          <p className="text-[13px] text-outline mt-1">or click to browse · PDF, XLSX, PPT supported</p>
        </button>

        {/* Table section */}
        <div className="bg-white ghost-border-solid rounded-card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-high">
            <p className="text-[11px] font-semibold tracking-widest text-outline uppercase">
              Recently processed · {rows.length} files
            </p>
          </div>
          {loading ? (
            <p className="text-[13px] text-on-surface-variant px-5 py-4">Loading files...</p>
          ) : (
            <FileTable data={rows} />
          )}
          {error && <p className="text-[12px] text-red-600 px-5 py-3">{error}</p>}
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
