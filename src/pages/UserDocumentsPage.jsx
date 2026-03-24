import { useEffect, useState } from 'react'
import { getDocuments } from '../api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getPreviewUrl(docId, token) {
  return `${API_BASE}/documents/${docId}/preview?token=${encodeURIComponent(token || '')}`
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return 'Unknown'
  }
}

function getDocType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return 'PDF'
  if (ext === 'docx' || ext === 'doc') return 'DOCX'
  if (ext === 'csv') return 'CSV'
  if (ext === 'xlsx' || ext === 'xls') return 'XLSX'
  if (ext === 'ppt' || ext === 'pptx') return 'PPTX'
  return 'FILE'
}

function getDocIcon(type) {
  if (type === 'PDF') return '📄'
  if (type === 'DOCX') return '📝'
  if (type === 'CSV' || type === 'XLSX') return '📊'
  if (type === 'PPTX') return '📑'
  return '📎'
}

function PreviewModal({ doc, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const type = getDocType(doc.filename)
  const canInline = type === 'PDF'

  useEffect(() => {
    let objectUrl = null
    const token = localStorage.getItem('mutant_token') || ''

    if (token === 'dummy-admin-token') {
      setLoadError('Preview is disabled in dummy testing mode. Sign in with a real account to preview files.')
      setLoading(false)
      return
    }

    fetch(getPreviewUrl(doc.id, token), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          let detail = ''
          try {
            const payload = await res.json()
            detail = payload?.detail || ''
          } catch {
            detail = ''
          }
          const fallback = `Preview request failed (${res.status})`
          throw new Error(detail || fallback)
        }
        return res.blob()
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch((err) => setLoadError(err.message || 'Unable to load document preview'))
      .finally(() => setLoading(false))

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [doc.id])

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [onClose])

  const handleDownload = () => {
    if (!blobUrl) return
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = doc.filename
    anchor.click()
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[min(960px,95vw)] h-[min(90vh,860px)] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <span className="text-2xl">{getDocIcon(type)}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 truncate" title={doc.filename}>
              {doc.filename}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{type}</p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!blobUrl}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Download
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            Close
          </button>
        </div>

        <div className="flex-1 bg-slate-100 relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading preview...</p>
            </div>
          )}

          {!loading && loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <p className="text-sm font-semibold text-red-600">{loadError}</p>
              <p className="text-xs text-slate-500">Try re-login if token expired, or verify the file still exists on the server.</p>
            </div>
          )}

          {!loading && !loadError && blobUrl && canInline && (
            <iframe src={blobUrl} title={doc.filename} className="w-full h-full border-none" />
          )}

          {!loading && !loadError && blobUrl && !canInline && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <span className="text-6xl">{getDocIcon(type)}</span>
              <p className="text-sm text-slate-600">
                {type} files cannot be rendered directly in browser preview.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Download {doc.filename}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UserDocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const docs = await getDocuments()
        setDocuments(docs)
      } catch (err) {
        setError(err.message || 'Failed to load documents')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="flex-1 min-h-screen bg-surface p-10">
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <span className="text-indigo-600 text-xs uppercase tracking-widest font-semibold mb-2 block">
            USER DOCUMENTS
          </span>
          <h1 className="text-4xl font-black tracking-tight text-on-surface font-headline">My Documents</h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Click any document card to preview it.
          </p>
        </header>

        {loading && <p className="text-sm text-on-surface-variant">Loading documents...</p>}
        {!loading && error && <p className="text-sm text-red-700">{error}</p>}

        {!loading && !error && documents.length === 0 && (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <p className="text-lg font-semibold text-on-surface">No documents available</p>
            <p className="text-sm text-on-surface-variant mt-2">
              Your uploaded and shared documents will appear here.
            </p>
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc) => {
              const type = getDocType(doc.filename)
              return (
                <button
                  type="button"
                  key={doc.id}
                  onClick={() => setPreviewDoc(doc)}
                  className="text-left bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group"
                  title={`Preview ${doc.filename}`}
                >
                  <div className="p-3 bg-indigo-100 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{getDocIcon(type)}</span>
                  </div>
                  <h3 className="font-semibold text-on-surface truncate" title={doc.filename}>
                    {doc.filename}
                  </h3>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {type}
                    </span>
                    <span className="text-xs text-on-surface-variant">{doc.status || 'uploaded'}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3">Added: {formatDate(doc.uploaded_at)}</p>
                  <p className="text-xs text-indigo-600 mt-2 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to preview
                  </p>
                </button>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}