import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUploadRequest, getDocuments, uploadDocument } from '../api'
import { useAuth } from '../context/AuthContext'
import UploadRequestModal from '../components/UploadRequestModal'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3200)
  }

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const docs = await getDocuments()
      setDocuments(Array.isArray(docs) ? docs : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const metrics = useMemo(() => {
    const total = documents.length
    const indexed = documents.filter((doc) => String(doc.status).toLowerCase() === 'indexed').length
    const latest = [...documents]
      .sort((a, b) => new Date(b.uploaded_at || 0).getTime() - new Date(a.uploaded_at || 0).getTime())
      .slice(0, 3)

    return { total, indexed, latest }
  }, [documents])

  const uploadedAgo = (iso) => {
    if (!iso) return 'Unknown time'
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <main className="w-full h-full p-8 lg:p-12 overflow-y-auto min-h-screen">
      {toast && (
        <div className="fixed top-6 right-6 z-[100]">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold max-w-sm ${
              toast.tone === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <header className="flex justify-between items-end mb-12">
        <div>
          <p className="text-label-sm font-label uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Systems Operational
          </p>
          <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface font-headline">
            Intelligence <span className="text-primary">Overview</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Avatar removed as per request */}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed rounded-2xl group-hover:bg-primary-container group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">folder_managed</span>
            </div>
            <span className="text-xs font-bold text-secondary">Live</span>
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface mb-1">
            {loading ? '...' : metrics.total}
          </div>
          <div className="text-sm font-body text-on-surface-variant">Total Documents</div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed rounded-2xl group-hover:bg-primary-container group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">query_stats</span>
            </div>
            <span className="text-xs font-bold text-primary">Synced</span>
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface mb-1">
            {loading ? '...' : metrics.indexed}
          </div>
          <div className="text-sm font-body text-on-surface-variant">Indexed In Pinecone</div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed rounded-2xl group-hover:bg-primary-container group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant">Active Agent</span>
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface mb-1">AI</div>
          <div className="text-sm font-body text-on-surface-variant">Intelligence Ready</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-headline tracking-tight text-on-surface">Archival Log</h2>
            <button className="text-primary text-sm font-bold hover:underline" onClick={() => navigate('/documents')}>
              View All
            </button>
          </div>
          <div className="bg-surface-container-low rounded-lg p-1 space-y-1">
            {loading && <p className="p-8 text-center text-on-surface-variant text-sm">Synchronizing archival data...</p>}
            {!loading && metrics.latest.length === 0 && (
              <p className="p-8 text-center text-on-surface-variant text-sm">No documents found. Start by uploading a file.</p>
            )}
            {!loading && metrics.latest.map((doc) => (
              <div key={doc.id} className="bg-surface-container-lowest p-6 rounded-lg flex items-center gap-6 transition-all hover:scale-[1.01]">
                <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">
                    {doc.filename.endsWith('.pdf') ? 'picture_as_pdf' : doc.filename.endsWith('.csv') ? 'table_chart' : 'description'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-on-surface-variant mb-1">Upload • {uploadedAgo(doc.uploaded_at)}</div>
                  <div className="font-headline text-lg font-semibold truncate">{doc.filename}</div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    doc.status === 'indexed' ? 'bg-green-100 text-green-700' : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {doc.status || 'Processed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-2xl font-bold font-headline tracking-tight text-on-surface">Accelerators</h2>
          <div className="grid grid-cols-1 gap-4">
            <button
              className="flex items-center justify-between p-6 bg-surface-container-highest text-on-surface rounded-lg transition-all hover:bg-surface-container-high active:scale-95 group"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-3xl text-primary">{isAdmin ? 'cloud_upload' : 'publish'}</span>
                <div className="text-left">
                  <div className="font-bold">{isAdmin ? 'Upload Doc' : 'Request Upload'}</div>
                  <div className="text-xs text-on-surface-variant">PDF, DOCX, CSV</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
            </button>
          </div>

          <div className="mt-8 p-8 bg-gradient-to-br from-indigo-600 to-tertiary-container rounded-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-4">AI Proactive Insight</div>
              <div className="text-2xl font-headline font-bold leading-tight mb-4">
                "Intelligence is verified across {metrics.indexed} localized document chunks."
              </div>
              <button 
                className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold hover:bg-white/30 transition-colors"
                onClick={() => navigate('/documents')}
              >
                Manage Data
              </button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 rotate-12">auto_awesome</span>
          </div>
        </div>
      </div>

      <UploadRequestModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        defaultAccessMode={!isAdmin ? (user?.department || 'All') : 'All'}
        onSubmit={async (data) => {
          try {
            if (isAdmin) {
              await uploadDocument(data.file, {
                accessMode: data.accessMode,
              });
              setIsUploadModalOpen(false);
              showToast(`Document uploaded successfully for the ${data.accessMode} department!`);
              loadDashboard();
            } else {
              const formData = new FormData();
              formData.append('file', data.file);
              formData.append('access_mode', data.accessMode);
              formData.append('department', data.accessMode);
              
              await createUploadRequest(formData);
              setIsUploadModalOpen(false);
              showToast(`Upload request sent to Admin for the ${data.accessMode} department!`);
            }
          } catch (err) {
            showToast('Failed to process upload: ' + err.message, 'error');
          }
        }}
      />
    </main>
  );
};

export default DashboardPage;
