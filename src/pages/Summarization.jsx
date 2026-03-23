import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import { exportSummary, getDocuments, summarizeDoc } from '../api'

// ─── helpers ──────────────────────────────────────────────────────────────────

const findingColors = {
  positive: 'bg-emerald-500',
  neutral:  'bg-blue-500',
  warning:  'bg-amber-500',
  risk:     'bg-red-500',
}
const findingBg = {
  positive: 'bg-emerald-50 border-emerald-200/60',
  neutral:  'bg-blue-50   border-blue-200/60',
  warning:  'bg-amber-50  border-amber-200/60',
  risk:     'bg-red-50    border-red-200/60',
}
const findingFg = {
  positive: 'text-emerald-700',
  neutral:  'text-blue-700',
  warning:  'text-amber-700',
  risk:     'text-red-700',
}

function getFileType(filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf')                         return { label: 'PDF',  icon: 'description',   bg: 'bg-red-50',     fg: 'text-red-600' }
  if (ext === 'doc'  || ext === 'docx')      return { label: 'DOCX', icon: 'article',        bg: 'bg-blue-50',    fg: 'text-blue-600' }
  if (ext === 'ppt'  || ext === 'pptx')      return { label: 'PPTX', icon: 'present_to_all', bg: 'bg-orange-50',  fg: 'text-orange-600' }
  if (ext === 'xls'  || ext === 'xlsx' || ext === 'csv')
                                             return { label: 'XLSX', icon: 'table_chart',    bg: 'bg-emerald-50', fg: 'text-emerald-600' }
  return { label: (ext || 'FILE').toUpperCase(), icon: 'dataset', bg: 'bg-indigo-50', fg: 'text-indigo-600' }
}

const STEPS = ['Reading document…', 'Analyzing content…', 'Generating summary…', 'Building insights…']

// ─── skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-xl bg-outline-variant/20" />
        <div className="w-5 h-5 rounded-full bg-outline-variant/20" />
      </div>
      <div className="mt-4 h-3 bg-outline-variant/20 rounded-full w-3/4" />
      <div className="mt-2 h-2 bg-outline-variant/15 rounded-full w-1/4" />
    </div>
  )
}

// ─── main component ────────────────────────────────────────────────────────────

export default function Summarization() {
  const [documents,        setDocuments]        = useState([])
  const [selectedFilename, setSelectedFilename] = useState('')
  const [summary,          setSummary]          = useState('')
  const [findings,         setFindings]         = useState([])
  const [pageCount,        setPageCount]        = useState(0)
  const [wordCount,        setWordCount]        = useState(0)
  const [isCached,         setIsCached]         = useState(false)
  const [loading,          setLoading]          = useState(true)
  const [summarizing,      setSummarizing]      = useState(false)
  const [error,            setError]            = useState('')
  const [showAllDocs,      setShowAllDocs]      = useState(false)
  const [step,             setStep]             = useState(0)
  const [search,           setSearch]           = useState('')
  const [copied,           setCopied]           = useState(false)

  const stepTimerRef = useRef(null)
  const summaryRef   = useRef(null)

  // ── fetch documents on mount ──────────────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const docs = await getDocuments()
        setDocuments(docs)
        if (docs.length) {
          setSelectedFilename(docs[0].filename)
          // Auto-load cached summary for first document
          const first = docs[0]
          if (first.summary) {
            try {
              const cached = JSON.parse(first.summary)
              if (cached?.summary) loadResult(cached, true)
            } catch { /* ignore */ }
          }
        } else {
          setError('Upload a document first to generate a summary.')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  // ── when user picks a different doc, show cached summary if available ─────
  const handleSelectDoc = useCallback((filename) => {
    setSelectedFilename(filename)
    setError('')
    // clear current result
    setSummary('')
    setFindings([])
    setPageCount(0)
    setWordCount(0)
    setIsCached(false)

    const doc = documents.find(d => d.filename === filename)
    if (doc?.summary) {
      try {
        const cached = JSON.parse(doc.summary)
        if (cached?.summary) {
          loadResult(cached, true)
          setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
        }
      } catch { /* ignore */ }
    }
  }, [documents])

  function loadResult(data, cached = false) {
    setSummary(data.summary || '')
    setFindings(data.findings || [])
    setPageCount(data.page_count || 0)
    setWordCount(data.word_count || 0)
    setIsCached(cached)
  }

  // ── step ticker during generation ─────────────────────────────────────────
  const startStepTicker = () => {
    setStep(0)
    let s = 0
    stepTimerRef.current = setInterval(() => {
      s = Math.min(s + 1, STEPS.length - 1)
      setStep(s)
    }, 2400)
  }
  const stopStepTicker = () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current)
  }

  // ── generate summary ───────────────────────────────────────────────────────
  const handleGenerateSummary = async (force = false) => {
    if (!selectedFilename) { setError('Please select a document first.'); return }
    setSummarizing(true)
    setError('')
    startStepTicker()
    try {
      const data = await summarizeDoc(selectedFilename, force)
      loadResult(data, data.cached ?? false)
      // update local cache in documents list
      setDocuments(prev => prev.map(d =>
        d.filename === selectedFilename
          ? { ...d, summary: JSON.stringify(data) }
          : d
      ))
      setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err.message)
    } finally {
      stopStepTicker()
      setSummarizing(false)
    }
  }

  // ── copy to clipboard ──────────────────────────────────────────────────────
  const handleCopy = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── export summary ─────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!selectedFilename || !summary) return
    exportSummary(selectedFilename)
  }

  // ── derived state ──────────────────────────────────────────────────────────
  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? documents.filter(d => d.filename.toLowerCase().includes(q)) : documents
  }, [documents, search])

  const hasMoreThanFour    = filteredDocs.length > 4
  const docsForGrid        = showAllDocs ? filteredDocs : filteredDocs.slice(0, 4)
  const selectedDoc        = useMemo(() => documents.find(d => d.filename === selectedFilename), [documents, selectedFilename])
  const selectedDocNumber  = useMemo(() => documents.findIndex(d => d.filename === selectedFilename) + 1, [documents, selectedFilename])
  const hasSummary         = !!summary

  const recommendedActions = useMemo(() => {
    if (findings.length >= 3) {
      return findings.slice(0, 3).map((f, idx) => ({
        priority: idx === 0 ? 'HIGH' : idx === 1 ? 'MED' : 'LOW',
        priorityColor: idx === 0 ? 'text-red-500' : idx === 1 ? 'text-amber-500' : 'text-emerald-600',
        title: `Finding ${idx + 1}`,
        text: f.text || String(f),
        type: f.type || 'neutral',
      }))
    }
    return [
      { priority: 'HIGH', priorityColor: 'text-red-500',     title: 'Review Cost Drivers',     text: 'Focus on the largest operational cost centers identified in the summary.',         type: 'risk'     },
      { priority: 'MED',  priorityColor: 'text-amber-500',   title: 'Create Alignment Plan',   text: 'Address collaboration gaps mentioned across team or department workflows.',         type: 'warning'  },
      { priority: 'LOW',  priorityColor: 'text-emerald-600', title: 'Refresh Stakeholder Brief',text: 'Turn key findings into a concise shareable update for stakeholders.',              type: 'positive' },
    ]
  }, [findings])

  // ─────────────────────────────────────────────────────────────────── render ─

  return (
    <div className="absolute inset-0 flex flex-col">
      <TopBar
        title="Document Summarization"
        actions={
          <>
            {hasSummary && (
              <button
                onClick={handleExport}
                className="px-3.5 py-2 border border-outline-variant/40 text-[13px] font-medium text-on-surface rounded-full hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export Summary
              </button>
            )}
          </>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 lg:p-8 bg-surface space-y-8">

        {/* ── hero ── */}
        <section className="space-y-2">
          <h1 className="text-on-surface font-headline font-extrabold text-[36px] lg:text-[52px] tracking-tight">
            Knowledge Summary
          </h1>
          <p className="text-on-surface-variant text-sm lg:text-lg max-w-3xl">
            Generate a consolidated summary from your selected documentation using Aura&apos;s advanced neural processing.
          </p>
        </section>

        {/* ── document picker ── */}
        <section className="space-y-4 lg:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg lg:text-xl font-headline font-semibold flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">library_books</span>
              Select Document to Summarize
            </h2>
            <div className="flex items-center gap-3">
              {/* search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">search</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter docs…"
                  className="pl-8 pr-3 py-1.5 text-sm bg-surface-container-low border border-outline-variant/30 rounded-full outline-none focus:ring-2 focus:ring-primary/30 w-36 lg:w-48 transition-all"
                />
              </div>
              {hasMoreThanFour && (
                <button
                  type="button"
                  onClick={() => setShowAllDocs(p => !p)}
                  className="text-xs lg:text-sm font-semibold text-primary hover:underline"
                >
                  {showAllDocs ? 'View Less' : `View All (${filteredDocs.length})`}
                </button>
              )}
              <span className="text-xs lg:text-sm text-on-surface-variant">
                {selectedFilename ? '1 selected' : 'None selected'}
              </span>
            </div>
          </div>

          {/* selected bar */}
          {selectedFilename && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-surface-container-low rounded-2xl px-4 py-3 border border-outline-variant/20">
              <p className="text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px]">task_alt</span>
                Selected:
                <span className="font-semibold ml-1 truncate max-w-[200px]">{selectedFilename}</span>
                {isCached && (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                    CACHED
                  </span>
                )}
              </p>
              <p className="text-sm text-on-surface-variant">
                Doc <span className="font-semibold text-on-surface">{selectedDocNumber > 0 ? selectedDocNumber : '-'}</span> of {documents.length}
              </p>
            </div>
          )}

          {/* grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : docsForGrid.map(doc => {
                  const isSelected = doc.filename === selectedFilename
                  const type       = getFileType(doc.filename)
                  const hasCached  = !!doc.summary
                  return (
                    <button
                      key={doc.id || doc.filename}
                      type="button"
                      onClick={() => handleSelectDoc(doc.filename)}
                      className={`text-left bg-surface-container-lowest rounded-2xl p-5 transition-all duration-200 shadow-[0_4px_16px_rgba(19,27,46,0.05)] ${
                        isSelected
                          ? 'ring-2 ring-primary shadow-[0_8px_24px_rgba(79,70,229,0.18)]'
                          : 'hover:shadow-[0_8px_24px_rgba(19,27,46,0.1)] hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`w-11 h-11 rounded-xl ${type.bg} ${type.fg} flex items-center justify-center flex-shrink-0`}>
                          <span className="material-symbols-outlined">{type.icon}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-primary' : 'text-outline-variant'}`}>
                            {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          {hasCached && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                              ✓ Cached
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-on-surface truncate">{doc.filename}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{type.label}</p>
                    </button>
                  )
                })
            }
            {!loading && filteredDocs.length === 0 && (
              <div className="col-span-4 text-center py-10 text-on-surface-variant text-sm">
                No documents match your search.
              </div>
            )}
          </div>
        </section>

        {/* ── generate button ── */}
        <div className="flex justify-center items-center gap-4 py-2">
          <button
            type="button"
            onClick={() => handleGenerateSummary(false)}
            disabled={!selectedFilename || loading || summarizing}
            className="px-10 py-4 bg-mutant-gradient text-white rounded-full font-headline font-bold text-base lg:text-lg shadow-[0_16px_34px_rgba(79,70,229,0.35)] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_20px_40px_rgba(79,70,229,0.45)] active:scale-[0.98] transition-all duration-200"
          >
            {summarizing ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {STEPS[step]}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                {isCached ? 'Re-generate Summary' : 'Generate Summary'}
              </>
            )}
          </button>

          {hasSummary && !summarizing && (
            <button
              type="button"
              onClick={() => handleGenerateSummary(true)}
              title="Force regenerate (ignore cache)"
              className="p-3 rounded-full border border-outline-variant/40 hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          )}
        </div>

        {/* ── error banner ── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <span className="material-symbols-outlined text-red-500 text-[22px] flex-shrink-0 mt-0.5">error</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Something went wrong</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}

        {/* ── AI generated summary ── */}
        <section ref={summaryRef} className="space-y-6 lg:space-y-8 pb-14">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">auto_awesome</span>
            <h2 className="text-2xl font-headline font-bold text-on-surface">AI Generated Summary</h2>
          </div>

          <div className="bg-surface-container-lowest rounded-[24px] p-6 lg:p-10 shadow-[0px_24px_60px_rgba(19,27,46,0.06)] relative overflow-hidden">
            {/* decorative blobs */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-10">

              {/* executive summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold tracking-[0.15em] text-primary uppercase">Executive Summary</p>
                  {hasSummary && !summarizing && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">{copied ? 'check' : 'content_copy'}</span>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                {/* loading state */}
                {loading && (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-outline-variant/20 rounded-full w-full" />
                    <div className="h-4 bg-outline-variant/20 rounded-full w-5/6" />
                    <div className="h-4 bg-outline-variant/20 rounded-full w-4/6" />
                  </div>
                )}

                {/* generating state */}
                {summarizing && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm text-on-surface-variant">{STEPS[step]}</p>
                    </div>
                    <div className="w-full bg-outline-variant/20 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-700"
                        style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* empty state */}
                {!loading && !summarizing && !hasSummary && !error && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <span className="material-symbols-outlined text-outline-variant text-[48px]">description</span>
                    <p className="text-on-surface-variant text-base">
                      Select a document above and click <strong>Generate Summary</strong> to create a consolidated overview.
                    </p>
                  </div>
                )}

                {/* summary text */}
                {hasSummary && !summarizing && (
                  <p className="text-base lg:text-[18px] font-headline font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
                    {summary}
                  </p>
                )}
              </div>

              {/* key insights + metrics (only when we have content) */}
              {(hasSummary || summarizing) && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* key insights */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold tracking-[0.15em] text-primary uppercase">Key Insights</p>
                    <div className="space-y-3">
                      {summarizing
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3 animate-pulse">
                              <div className="w-2 h-2 rounded-full bg-outline-variant/30 mt-2 flex-shrink-0" />
                              <div className="flex-1 h-3 bg-outline-variant/20 rounded-full" style={{ width: `${70 + i * 7}%` }} />
                            </div>
                          ))
                        : findings.length
                          ? findings.map((item, i) => (
                              <div
                                key={i}
                                className={`flex items-start gap-3 p-3 rounded-xl border ${findingBg[item.type] || findingBg.neutral} transition-all`}
                              >
                                <div className={`w-2 h-2 rounded-full ${findingColors[item.type] || findingColors.neutral} mt-2 flex-shrink-0`} />
                                <p className={`text-sm leading-relaxed ${findingFg[item.type] || findingFg.neutral}`}>
                                  {item.text || String(item)}
                                </p>
                              </div>
                            ))
                          : (
                              <p className="text-sm text-on-surface-variant">No structured findings returned for this document.</p>
                            )
                      }
                    </div>
                  </div>

                  {/* metrics */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold tracking-[0.15em] text-emerald-600 uppercase">Summary Metrics</p>
                    <div className="bg-surface-container-low rounded-2xl p-5 space-y-5">
                      {/* pages */}
                      <div>
                        <div className="flex items-end justify-between mb-1.5">
                          <span className="text-sm text-on-surface-variant">Pages Analyzed</span>
                          {summarizing
                            ? <div className="w-8 h-5 bg-outline-variant/20 rounded animate-pulse" />
                            : <span className="text-2xl font-headline font-extrabold text-emerald-600">{pageCount}</span>
                          }
                        </div>
                        <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                            style={{ width: summarizing ? '30%' : `${Math.min(100, Math.max(12, (findings.length || 1) * 16))}%` }}
                          />
                        </div>
                      </div>

                      <div className="border-t border-outline-variant/20 pt-4 space-y-3">
                        <MetricRow label="Key Findings" value={summarizing ? '…' : findings.length} />
                        <MetricRow label="Word Count"   value={summarizing ? '…' : (wordCount ? wordCount.toLocaleString() : '—')} />
                        <MetricRow
                          label="Selected File"
                          value={selectedDoc?.filename || '—'}
                          truncate
                        />
                        <MetricRow
                          label="Status"
                          value={isCached ? 'Cached' : hasSummary ? 'Fresh' : '—'}
                          badge={isCached ? 'emerald' : hasSummary ? 'blue' : undefined}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* recommended actions */}
              {(hasSummary || summarizing) && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs font-bold tracking-[0.15em] text-tertiary uppercase">Recommended Actions</p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {summarizing
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="p-4 rounded-2xl bg-surface-container-low animate-pulse space-y-2">
                            <div className="h-2.5 bg-outline-variant/20 rounded-full w-1/3" />
                            <div className="h-3.5 bg-outline-variant/20 rounded-full w-2/3" />
                            <div className="h-2.5 bg-outline-variant/15 rounded-full w-full" />
                          </div>
                        ))
                      : recommendedActions.map((action, idx) => (
                          <div
                            key={`${action.title}-${idx}`}
                            className={`p-4 rounded-2xl border ${findingBg[action.type] || findingBg.neutral} transition-all hover:-translate-y-0.5 hover:shadow-md duration-200`}
                          >
                            <p className={`text-[11px] font-bold mb-1 ${action.priorityColor}`}>PRIORITY: {action.priority}</p>
                            <p className="text-sm font-semibold text-on-surface">{action.title}</p>
                            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{action.text}</p>
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// ── small helper component ──────────────────────────────────────────────────────

function MetricRow({ label, value, truncate, badge }) {
  return (
    <div className="flex justify-between text-sm items-center gap-2">
      <span className="text-on-surface-variant">{label}</span>
      {badge ? (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
          badge === 'emerald' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-100   text-blue-700  border border-blue-200'
        }`}>
          {value}
        </span>
      ) : (
        <span className={`font-semibold text-on-surface text-right ${truncate ? 'truncate max-w-[140px]' : ''}`}>
          {value}
        </span>
      )}
    </div>
  )
}
