import { useEffect, useRef, useState } from 'react'
import { getDocuments, uploadDocument } from '../api'

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

  return (
    <main className="flex-1 min-h-screen bg-surface p-6 md:p-8">
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
            className="w-full border border-dashed border-outline-variant rounded-card p-8 text-center hover:border-accent hover:bg-accent/5 transition-all disabled:opacity-60"
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
        {uploading && <div className="rounded-card border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">Uploading document: {uploadProgress}%</div>}

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
                  <span className="text-[11px] px-2 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium">
                    {formatType(doc.filename)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
