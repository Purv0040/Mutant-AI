import { useEffect, useRef, useState } from 'react'
import { deleteDocument, getDocumentChunkCounts, getDocuments, uploadDocument } from '../api'
import UploadRequestModal from './UploadRequestModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const typeStyle = {
  PDF:  { badge: 'bg-red-100 text-red-700',   icon: '📄' },
  DOCX: { badge: 'bg-blue-100 text-blue-700',  icon: '📝' },
  CSV:  { badge: 'bg-green-100 text-green-700', icon: '📊' },
  XLSX: { badge: 'bg-emerald-100 text-emerald-700', icon: '📊' },
  PPTX: { badge: 'bg-orange-100 text-orange-700', icon: '📑' },
}

function extensionType(filename) {
  const ext = (filename.split('.').pop() || '').toUpperCase()
  if (['XLSX', 'XLS'].includes(ext)) return 'XLSX'
  if (ext === 'DOCX' || ext === 'DOC') return 'DOCX'
  if (ext === 'CSV') return 'CSV'
  if (['PPTX', 'PPT'].includes(ext)) return 'PPTX'
  return 'PDF'
}

function getPreviewUrl(docId) {
  const token = localStorage.getItem('mutant_token') || ''
  return `${API_BASE}/documents/${docId}/preview?token=${encodeURIComponent(token)}`
}

// ── Preview Modal ──────────────────────────────────────────────────────────────
function PreviewModal({ file, onClose }) {
  const type = extensionType(file.filename)
  const previewUrl = getPreviewUrl(file.id)
  const [blobUrl, setBlobUrl] = useState(null)
  const [loadErr, setLoadErr] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Fetch with Authorization header, create blob URL — works for all file types
  useEffect(() => {
    let objectUrl = null
    const token = localStorage.getItem('mutant_token') || ''
    fetch(`${API_BASE}/documents/${file.id}/preview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load document')
        return res.blob()
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch(() => setLoadErr(true))
      .finally(() => setFetching(false))

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file.id])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const canInline = type === 'PDF' // PDF renders natively in browser
  const style = typeStyle[type] || typeStyle.PDF

  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = file.filename
    a.click()
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 'min(900px, 95vw)', height: 'min(90vh, 860px)', animation: 'popIn 0.2s ease-out' }}
      >
        {/* Modal header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <span className="text-xl">{style.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-gray-800 truncate" title={file.filename}>
              {file.filename}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{type}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                file.status === 'indexed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {file.status || 'processed'}
              </span>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={!blobUrl}
            title="Download"
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px] text-gray-600">download</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-gray-600">close</span>
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          {fetching && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-[13px] text-gray-500 font-medium">Loading document…</p>
            </div>
          )}

          {!fetching && loadErr && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-gray-300">broken_image</span>
              <p className="text-[14px] font-semibold text-gray-600">Could not load preview</p>
              <p className="text-[12px] text-gray-400">This file type may not be previewable in the browser.</p>
              <button
                onClick={handleDownload}
                className="mt-2 px-5 py-2.5 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Download Instead
              </button>
            </div>
          )}

          {!fetching && !loadErr && blobUrl && canInline && (
            <iframe
              src={blobUrl}
              title={file.filename}
              className="w-full h-full border-none"
            />
          )}

          {!fetching && !loadErr && blobUrl && !canInline && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <span className="text-6xl">{style.icon}</span>
              <p className="text-[16px] font-bold text-gray-700">{file.filename}</p>
              <p className="text-[13px] text-gray-400 max-w-xs">
                <strong>{type}</strong> files cannot be rendered inline in the browser.
                Download it to open with the appropriate application.
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download {file.filename}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.94); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── DocumentPanel ──────────────────────────────────────────────────────────────
export default function DocumentPanel({ onUploaded }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deletingId, setDeletingId] = useState('')
  const [chunkCountByDocId, setChunkCountByDocId] = useState({})
  const [checkingChunks, setCheckingChunks] = useState(false)
  const [error, setError] = useState('')
  const [previewFile, setPreviewFile] = useState(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
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
      data.forEach((item) => { next[item.document_id] = item })
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
      if (onUploaded) onUploaded(result.filename)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      event.target.value = ''
    }
  }

  const handleModalSubmit = async ({ file, accessMode }) => {
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    setError('')
    try {
      const result = await uploadDocument(file, {
        onProgress: (percent) => setUploadProgress(percent),
        accessMode,
      })
      await loadDocuments()
      await loadChunkCounts()
      if (onUploaded) onUploaded(result.filename)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
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
    <>
      {/* Upload Document Modal */}
      <UploadRequestModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* Preview Modal */}
      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

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
          {!loading && files.length === 0 && (
            <p className="text-[12px] text-on-surface-variant px-2 py-2">No documents uploaded yet.</p>
          )}
          {!loading && files.map((file) => {
            const type = extensionType(file.filename)
            const style = typeStyle[type] || typeStyle.PDF
            return (
              <div
                key={file.id}
                onClick={() => setPreviewFile(file)}
                className="flex items-start gap-2.5 px-2 py-2.5 rounded-btn hover:bg-surface-container transition-all cursor-pointer group"
                title={`Click to preview ${file.filename}`}
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
                  {/* Preview hint */}
                  <p className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 font-medium">
                    Click to preview
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
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

        {/* Upload zone */}
        <div className="p-3">
          {uploading && (
            <p className="text-[11px] text-blue-700 mb-2">Uploading document: {uploadProgress}%</p>
          )}
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
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
            <p className="text-[11px] font-medium text-on-surface-variant">
              {uploading ? 'Uploading...' : 'Upload file'}
            </p>
            <p className="text-[10px] text-outline mt-0.5">PDF, DOCX, CSV</p>
          </button>
        </div>
      </aside>
    </>
  )
}
