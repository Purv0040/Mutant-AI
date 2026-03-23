import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/TopBar'
import { getDocuments, summarizeDoc } from '../api'

const findingColors = {
  positive: 'bg-green-500',
  neutral: 'bg-blue-500',
  warning: 'bg-amber-500',
  risk: 'bg-red-500',
}

function getFileType(filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return { label: 'PDF', icon: 'description', bg: 'bg-red-50', fg: 'text-red-600' }
  if (ext === 'doc' || ext === 'docx') return { label: 'DOCX', icon: 'article', bg: 'bg-blue-50', fg: 'text-blue-600' }
  if (ext === 'ppt' || ext === 'pptx') return { label: 'PPTX', icon: 'present_to_all', bg: 'bg-orange-50', fg: 'text-orange-600' }
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return { label: 'XLSX', icon: 'table_chart', bg: 'bg-emerald-50', fg: 'text-emerald-600' }
  return { label: (ext || 'FILE').toUpperCase(), icon: 'dataset', bg: 'bg-indigo-50', fg: 'text-indigo-600' }
}

export default function Summarization() {
  const [documents, setDocuments] = useState([])
  const [selectedFilename, setSelectedFilename] = useState('')
  const [summary, setSummary] = useState('')
  const [findings, setFindings] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [summarizing, setSummarizing] = useState(false)
  const [error, setError] = useState('')
  const [showAllDocs, setShowAllDocs] = useState(false)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const docs = await getDocuments()
        setDocuments(docs)
        if (!docs.length) {
          setError('Upload a document first to generate summary.')
          return
        }
        setSelectedFilename(docs[0].filename)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const hasMoreThanFour = documents.length > 4
  const selectedCount = selectedFilename ? 1 : 0
  const docsForSummarySection = showAllDocs ? documents : documents.slice(0, 4)

  const selectedDoc = useMemo(
    () => documents.find((d) => d.filename === selectedFilename),
    [documents, selectedFilename]
  )

  const selectedDocNumber = useMemo(
    () => documents.findIndex((d) => d.filename === selectedFilename) + 1,
    [documents, selectedFilename]
  )

  const recommendedActions = useMemo(() => {
    if (findings.length >= 3) {
      return findings.slice(0, 3).map((f, idx) => ({
        priority: idx === 0 ? 'HIGH' : idx === 1 ? 'MED' : 'LOW',
        title: `Action ${idx + 1}`,
        text: f.text || String(f),
      }))
    }

    return [
      { priority: 'HIGH', title: 'Review Cost Drivers', text: 'Focus on the largest operational cost centers identified in the summary.' },
      { priority: 'MED', title: 'Create Alignment Plan', text: 'Address collaboration gaps mentioned across team or department workflows.' },
      { priority: 'LOW', title: 'Refresh Stakeholder Brief', text: 'Turn key findings into a concise shareable update for stakeholders.' },
    ]
  }, [findings])

  const handleGenerateSummary = async () => {
    if (!selectedFilename) {
      setError('Please select a document first.')
      return
    }

    setSummarizing(true)
    setError('')
    try {
      const data = await summarizeDoc(selectedFilename)
      setSummary(data.summary || '')
      setFindings(data.findings || [])
      setPageCount(data.page_count || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Document Summarization"
        actions={
          <>
            <button className="px-3.5 py-2 border border-outline-variant/40 text-[13px] font-medium text-on-surface rounded-full hover:bg-surface-container-low transition-colors">
              Export Summary
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 lg:p-8 bg-surface space-y-8">
        <section className="space-y-2">
          <h2 className="text-on-surface font-headline font-extrabold text-[36px] lg:text-[52px] tracking-tight">Knowledge Summary</h2>
          <p className="text-on-surface-variant text-sm lg:text-lg max-w-3xl">
            Generate a consolidated summary from your selected documentation using Aura&apos;s advanced neural processing.
          </p>
        </section>

        <section className="space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg lg:text-xl font-headline font-semibold flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">library_books</span>
              Select Documents to Summarize
            </h3>
            <div className="flex items-center gap-4">
              {hasMoreThanFour && (
                <button
                  type="button"
                  onClick={() => setShowAllDocs((prev) => !prev)}
                  className="text-xs lg:text-sm font-semibold text-primary hover:underline"
                >
                  {showAllDocs ? 'View Less' : 'View All'}
                </button>
              )}
              <span className="text-xs lg:text-sm text-on-surface-variant">{selectedCount} document{selectedCount === 1 ? '' : 's'} selected</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-surface-container-low rounded-2xl px-4 py-3">
            <p className="text-sm text-on-surface">
              Selected item:
              <span className="font-semibold ml-1">{selectedDoc?.filename || 'None'}</span>
            </p>
            <p className="text-sm text-on-surface-variant">
              Doc no:
              <span className="font-semibold text-on-surface ml-1">{selectedDocNumber > 0 ? selectedDocNumber : '-'}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {docsForSummarySection.map((doc) => {
              const isSelected = doc.filename === selectedFilename
              const type = getFileType(doc.filename)
              return (
                <button
                  key={doc.id || doc.filename}
                  type="button"
                  onClick={() => setSelectedFilename(doc.filename)}
                  className={`text-left bg-surface-container-lowest rounded-2xl p-5 transition-all shadow-[0_8px_24px_rgba(19,27,46,0.05)] ${
                    isSelected ? 'ring-2 ring-primary/90' : 'hover:shadow-[0_12px_28px_rgba(19,27,46,0.08)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-11 h-11 rounded-xl ${type.bg} ${type.fg} flex items-center justify-center`}>
                      <span className="material-symbols-outlined">{type.icon}</span>
                    </div>
                    <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-primary' : 'text-outline-variant'}`}>
                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-on-surface truncate">{doc.filename}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{type.label}</p>
                </button>
              )
            })}
          </div>
        </section>

        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={!selectedFilename || loading || summarizing}
            className="px-10 py-4 bg-mutant-gradient text-white rounded-full font-headline font-bold text-base lg:text-lg shadow-[0_16px_34px_rgba(79,70,229,0.35)] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            {summarizing ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>

        <section className="space-y-6 lg:space-y-8 pb-14">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">auto_awesome</span>
            <h3 className="text-2xl font-headline font-bold text-on-surface">AI Generated Summary</h3>
          </div>

          <div className="bg-surface-container-lowest rounded-[24px] p-6 lg:p-10 shadow-[0px_24px_60px_rgba(19,27,46,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 bg-tertiary/10 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-10">
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-[0.15em] text-primary uppercase">Executive Summary</p>
                {loading && <p className="text-on-surface-variant">Loading documents...</p>}
                {!loading && !summary && !error && (
                  <p className="text-lg text-on-surface-variant">
                    Select a document and click Generate Summary to create a consolidated overview.
                  </p>
                )}
                {!!summary && <p className="text-xl lg:text-[30px] font-headline font-semibold text-on-surface leading-snug">{summary}</p>}
                {!!error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-xs font-bold tracking-[0.15em] text-primary uppercase">Key Insights</p>
                  <div className="space-y-3">
                    {findings.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full ${findingColors[item.type] || findingColors.neutral} mt-2 flex-shrink-0`} />
                        <p className="text-sm lg:text-[15px] text-on-surface-variant leading-relaxed">{item.text || String(item)}</p>
                      </div>
                    ))}
                    {!loading && !summarizing && !findings.length && !!summary && (
                      <p className="text-sm text-on-surface-variant">No structured key findings were returned for this document.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold tracking-[0.15em] text-emerald-600 uppercase">Summary Metrics</p>
                  <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
                    <div className="flex items-end justify-between">
                      <span className="text-sm text-on-surface-variant">Pages Analyzed</span>
                      <span className="text-2xl font-headline font-extrabold text-emerald-600">{pageCount || 0}</span>
                    </div>
                    <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, Math.max(12, (findings.length || 1) * 16))}%` }} />
                    </div>
                    <div className="pt-2 border-t border-outline-variant/20 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Key Findings</span>
                        <span className="font-bold text-on-surface">{findings.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Selected File</span>
                        <span className="font-semibold text-on-surface truncate max-w-[160px] text-right">{selectedDoc?.filename || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-xs font-bold tracking-[0.15em] text-tertiary uppercase">Recommended Actions</p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {recommendedActions.map((action, idx) => (
                    <div key={`${action.title}-${idx}`} className="p-4 rounded-2xl bg-surface-container-low">
                      <p className="text-[11px] font-bold text-primary mb-1">PRIORITY: {action.priority}</p>
                      <p className="text-sm font-semibold text-on-surface">{action.title}</p>
                      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{action.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
