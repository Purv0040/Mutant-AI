import { useEffect, useRef, useState } from 'react'
import { deleteDocument, getDocuments, uploadDocument } from '../api'

function formatType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return 'PDF'
  if (ext === 'docx') return 'DOCX'
  if (ext === 'csv') return 'CSV'
  return ext.toUpperCase() || 'FILE'
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const fileInputRef = useRef(null)

  const loadDocuments = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getDocuments()
      setDocuments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setError('')
    setNotice('')

    try {
      const result = await uploadDocument(file, {
        onProgress: (percent) => setUploadProgress(percent),
      })
      const bpStatus = result.botpress_status || 'unknown'
      const bpId = result.botpress_file_id || 'not returned'
      setNotice(`Uploaded ${result.filename}. Botpress status: ${bpStatus}. Botpress file id: ${bpId}`)
      await loadDocuments()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      event.target.value = ''
    }
  }

  const handleDelete = async (docId, filename) => {
    setDeletingId(docId)
    setError('')
    setNotice('')
    try {
      await deleteDocument(docId)
      setNotice(`Deleted ${filename}`)
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <main className="flex-1 min-h-screen bg-surface p-6 md:p-8">
      {/* Upload Progress Modal */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Spinning Icon */}
              <div className="animate-spin">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-on-surface mb-2">Uploading Document</h2>
                <p className="text-sm text-on-surface-variant">Please wait while your file is being processed...</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              {/* Progress Percentage */}
              <p className="text-sm font-medium text-accent">{uploadProgress}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-on-surface">Upload Documents</h1>
          <p className="text-sm text-on-surface-variant">Accepted formats: PDF, DOCX, CSV</p>
        </div>

        <div className="bg-white rounded-card border border-outline-variant/30 p-5">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.csv"
            onChange={handleUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border border-dashed border-outline-variant rounded-card p-8 text-center hover:border-accent hover:bg-accent/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <div className="flex justify-center mb-3 text-on-surface-variant">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <p className="text-sm font-medium text-on-surface">{uploading ? 'Uploading document...' : 'Click to select document'}</p>
            <p className="text-xs text-on-surface-variant mt-1">File will be processed and sent to Botpress knowledge indexing.</p>
          </button>
        </div>

        {notice && <div className="rounded-card border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
        {error && <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="bg-white rounded-card border border-outline-variant/30 p-4">
          <h2 className="font-semibold text-on-surface mb-3">Your documents</h2>

          {loading && <p className="text-sm text-on-surface-variant">Loading documents...</p>}
          {!loading && documents.length === 0 && <p className="text-sm text-on-surface-variant">No documents uploaded yet.</p>}

          {!loading && documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 rounded-btn border border-outline-variant/20 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{doc.filename}</p>
                    <p className="text-xs text-on-surface-variant">Status: {doc.status} • Botpress ID: {doc.botpress_file_id || 'n/a'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium">
                      {formatType(doc.filename)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      disabled={deletingId === doc.id}
                      className="text-[11px] px-2 py-1 rounded-full bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
