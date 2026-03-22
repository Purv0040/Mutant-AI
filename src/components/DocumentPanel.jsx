import { useEffect, useRef, useState } from 'react'
import { deleteDocument, getDocumentChunkCounts, getDocuments, uploadDocument } from '../api'

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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deletingId, setDeletingId] = useState('')
  const [chunkCountByDocId, setChunkCountByDocId] = useState({})
  const [checkingChunks, setCheckingChunks] = useState(false)
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

  const loadChunkCounts = async () => {
    setCheckingChunks(true)
    try {
      const data = await getDocumentChunkCounts()
      const next = {}
      data.forEach((item) => {
        next[item.document_id] = item
      })
      setChunkCountByDocId(next)
    } catch (err) {
      setError(err.message)
    } finally {
      setCheckingChunks(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadDocuments()
      await loadChunkCounts()
    }
    init()
  }, [])

  const handleSelectFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setError('')
    try {
      const result = await uploadDocument(file, {
        onProgress: (percent) => setUploadProgress(percent),
      })
      await loadDocuments()
      await loadChunkCounts()
      if (onUploaded) {
        onUploaded(result.filename)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      event.target.value = ''
    }
  }

  const handleDelete = async (docId) => {
    setDeletingId(docId)
    setError('')
    try {
      await deleteDocument(docId)
      setFiles((prev) => prev.filter((doc) => doc.id !== docId))
      setChunkCountByDocId((prev) => {
        const next = { ...prev }
        delete next[docId]
        return next
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-surface-low border-l border-surface-high flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-surface-high flex items-center justify-between">
        <span className="font-semibold text-[14px] text-on-surface">Documents</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadChunkCounts}
            disabled={checkingChunks}
            className="text-[10px] px-2 py-1 rounded bg-surface-container border border-surface-high hover:bg-surface-high disabled:opacity-60"
          >
            {checkingChunks ? 'Checking...' : 'Verify'}
          </button>
          <span className="bg-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {files.length}
          </span>
        </div>
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
                  {chunkCountByDocId[file.id] && (
                    <span className="text-[10px] text-on-surface-variant">
                      {chunkCountByDocId[file.id].pinecone_chunks} chunks
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  handleDelete(file.id)
                }}
                disabled={deletingId === file.id}
                className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingId === file.id ? '...' : 'Del'}
              </button>
            </div>
          )
        })}
        {error && <p className="text-[11px] text-red-600 px-2 py-2">{error}</p>}
      </div>

      {/* Drop zone */}
      <div className="p-3">
        {uploading && (
          <p className="text-[11px] text-blue-700 mb-2">Uploading document: {uploadProgress}%</p>
        )}
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
