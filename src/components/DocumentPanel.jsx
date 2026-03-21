import { useEffect, useRef, useState } from 'react'
import { getDocuments, uploadDocument } from '../api'

const typeStyle = {
  PDF: { badge: 'bg-red-100 text-red-700', icon: '📄' },
  DOCX: { badge: 'bg-blue-100 text-blue-700', icon: '📝' },
  CSV: { badge: 'bg-green-100 text-green-700', icon: '📊' },
}

function extensionType(filename) {
  const ext = filename.split('.').pop()?.toUpperCase()
  if (ext === 'DOCX') return 'DOCX'
  if (ext === 'CSV') return 'CSV'
  return 'PDF'
}

export default function DocumentPanel({ onUploaded }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const loadDocuments = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getDocuments()
      setFiles(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleSelectFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const result = await uploadDocument(file)
      await loadDocuments()
      if (onUploaded) {
        onUploaded(result.filename)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

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
        {loading && <p className="text-[12px] text-on-surface-variant px-2 py-2">Loading documents...</p>}
        {!loading && files.length === 0 && <p className="text-[12px] text-on-surface-variant px-2 py-2">No documents uploaded yet.</p>}
        {!loading && files.map((file) => {
          const type = extensionType(file.filename)
          const style = typeStyle[type] || typeStyle.PDF
          return (
            <div
              key={file.id}
              className="flex items-start gap-2.5 px-2 py-2.5 rounded-btn hover:bg-surface-container transition-all cursor-pointer group"
            >
              <span className="text-lg mt-0.5">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-on-surface truncate group-hover:text-primary">
                  {file.filename}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}>
                    {type}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">{file.status}</span>
                </div>
              </div>
            </div>
          )
        })}
        {error && <p className="text-[11px] text-red-600 px-2 py-2">{error}</p>}
      </div>

      {/* Drop zone */}
      <div className="p-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.csv"
          onChange={handleSelectFile}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border border-dashed border-outline-variant rounded-card p-4 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer disabled:opacity-60"
        >
          <div className="flex justify-center mb-2 text-on-surface-variant">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          <p className="text-[11px] font-medium text-on-surface-variant">{uploading ? 'Uploading...' : 'Upload file'}</p>
          <p className="text-[10px] text-outline mt-0.5">PDF, DOCX, CSV</p>
        </button>
      </div>
    </aside>
  )
}
