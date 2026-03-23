import { useEffect, useRef, useState } from 'react'
import { deleteDocument, getDocuments, uploadDocument } from '../api'

function formatType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return 'PDF'
  if (ext === 'docx') return 'DOCX'
  if (ext === 'csv') return 'CSV'
  if (ext === 'xlsx') return 'XLSX'
  if (ext === 'ppt' || ext === 'pptx') return 'PPT'
  return ext.toUpperCase() || 'FILE'
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return '📄'
  if (ext === 'docx' || ext === 'doc') return '📝'
  if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') return '📊'
  if (ext === 'ppt' || ext === 'pptx') return '🎨'
  return '📎'
}

function getTypeColor(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return 'bg-red-50 text-red-700'
  if (ext === 'docx' || ext === 'doc') return 'bg-blue-50 text-blue-700'
  if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') return 'bg-emerald-50 text-emerald-700'
  if (ext === 'ppt' || ext === 'pptx') return 'bg-orange-50 text-orange-700'
  return 'bg-gray-50 text-gray-700'
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return 'Unknown'
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [menuOpenId, setMenuOpenId] = useState(null)
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
    <main className="flex-1 min-h-screen bg-surface p-10 relative overflow-hidden">
      {/* Upload Progress Modal */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="animate-spin">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-on-surface mb-2">Uploading Document</h2>
                <p className="text-sm text-on-surface-variant">Processing your file...</p>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-sm font-medium text-indigo-600">{uploadProgress}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-indigo-600 text-xs uppercase tracking-widest font-semibold mb-2 block">DOCUMENT LIBRARY</span>
              <h2 className="text-4xl font-black tracking-tight text-on-surface font-headline">Documents</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100/50 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="text-slate-600 text-sm">
                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </span>
                <span className="text-sm font-medium text-on-surface-variant">{documents.length} Documents</span>
              </div>
            </div>
          </div>
        </header>

        {/* Upload Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.csv,.xlsx"
              onChange={handleUpload}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-2xl p-12 text-center hover:bg-indigo-50/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-indigo-100 rounded-2xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-on-surface">{uploading ? 'Uploading...' : 'Upload your Intelligence'}</p>
              <p className="text-xs text-on-surface-variant mt-2">Drag and drop files here, or click to browse. Accepted: PDF, DOCX, CSV, XLSX</p>
            </button>
          </div>

          {notice && (
            <div className="mt-4 rounded-2xl bg-emerald-50 px-6 py-4">
              <p className="text-sm text-emerald-800">{notice}</p>
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 px-6 py-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </section>

        {/* Documents Grid */}
        <section className="relative">
          {/* Header */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-on-surface font-headline">Uploaded Documents</h3>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <p className="text-sm text-on-surface-variant">Loading documents...</p>
            </div>
          )}

          {!loading && documents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg font-medium text-on-surface">No documents yet</p>
              <p className="text-sm text-on-surface-variant mt-1">Upload your first document to get started</p>
            </div>
          )}

          {!loading && documents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 relative"
                >
                  {/* 3-Dot Menu */}
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                      title="More options"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpenId === doc.id && (
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 z-10 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleDelete(doc.id, doc.filename)
                            setMenuOpenId(null)
                          }}
                          disabled={deletingId === doc.id}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* File Icon Container */}
                  <div className="p-4 bg-indigo-100 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{getFileIcon(doc.filename)}</span>
                  </div>

                  {/* File Name */}
                  <h4 className="font-semibold text-on-surface truncate pr-6 mb-2" title={doc.filename}>
                    {doc.filename}
                  </h4>

                  {/* Type Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {formatType(doc.filename)}
                    </span>
                  </div>

                  {/* File Meta */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Status</span>
                      <span className="font-medium text-on-surface capitalize">{doc.status || 'uploaded'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Added</span>
                      <span className="font-medium text-on-surface">{formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Workspace Button - Static */}
          <div className="absolute bottom-0 right-0 mb-8 mr-8">
            <button className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Workspace
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
