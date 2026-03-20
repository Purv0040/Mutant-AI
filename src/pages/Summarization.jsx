import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import { getDocuments, summarizeDoc } from '../api'

const statCards = [
  {
    label: 'Pages Read',
    value: '50',
    sub: 'Full document',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: 'Key Findings',
    value: '8',
    sub: 'Identified',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="2">
        <line x1="12" y1="2" x2="12" y2="6" />
        <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      </svg>
    ),
  },
  {
    label: 'Stats Extracted',
    value: '24',
    sub: 'Data points',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Read Time Saved',
    value: '3.2 hrs',
    sub: 'vs manual read',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
]

const findingColors = {
  positive: 'bg-green-500',
  neutral: 'bg-blue-500',
  warning: 'bg-amber-500',
  risk: 'bg-red-500',
}

const suggestions = [
  'What are the financial risks?',
  'Which regions grew fastest?',
  'What is the headcount growth?',
  'What are Q1 2025 plans?',
]

export default function Summarization() {
  const [filename, setFilename] = useState('')
  const [summary, setSummary] = useState('')
  const [findings, setFindings] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const docs = await getDocuments()
        if (!docs.length) {
          setError('Upload a document first to generate summary.')
          return
        }
        const selected = docs[0]
        setFilename(selected.filename)

        const data = await summarizeDoc(selected.filename)
        setSummary(data.summary)
        setFindings(data.findings || [])
        setPageCount(data.page_count || 0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const computedCards = [
    { ...statCards[0], value: String(pageCount || 0), sub: 'From analyzed file' },
    { ...statCards[1], value: String(findings.length || 0), sub: 'Identified' },
    statCards[2],
    statCards[3],
  ]

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Document Summarization"
        actions={
          <>
            <button className="px-3.5 py-2 border border-outline-variant text-[13px] font-medium text-on-surface rounded-btn hover:bg-surface-low transition-colors">
              Export Summary
            </button>
            <button className="px-3.5 py-2 bg-primary text-white text-[13px] font-medium rounded-btn hover:bg-accent transition-colors">
              Ask Questions
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
        {/* Document info row */}
        <div className="bg-white ghost-border-solid rounded-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-xl">📄</div>
          <div className="flex-1">
            <p className="font-semibold text-[15px] text-on-surface tracking-tight">{filename || 'No document selected'}</p>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              {pageCount || 0} pages ·
              <span className="ml-1 text-green-600 font-medium">✓ Auto-summarized</span>
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {computedCards.map((card) => (
            <div key={card.label} className="bg-white ghost-border-solid rounded-card p-4">
              <div className="mb-3">{card.icon}</div>
              <p className="text-[28px] font-bold text-on-surface tracking-tight leading-none">{card.value}</p>
              <p className="text-[12px] font-semibold text-on-surface mt-1">{card.label}</p>
              <p className="text-[11px] text-on-surface-variant">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Executive Summary */}
          <div className="bg-white ghost-border-solid rounded-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-[15px] text-on-surface tracking-tight">Executive Summary</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">AI Generated</span>
            </div>
            {loading && <p className="text-[13px] text-on-surface-variant">Generating summary...</p>}
            {!loading && !error && <p className="text-[14px] text-on-surface leading-relaxed">{summary}</p>}
            {error && <p className="text-[13px] text-red-600">{error}</p>}
          </div>

          {/* Key Findings */}
          <div className="bg-white ghost-border-solid rounded-card p-5">
            <h3 className="font-semibold text-[15px] text-on-surface tracking-tight mb-4">Key Findings</h3>
            <div className="space-y-3">
              {findings.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full ${findingColors[item.type] || findingColors.neutral} mt-1.5 flex-shrink-0`} />
                  <p className="text-[13px] text-on-surface leading-snug">{item.text || String(item)}</p>
                </div>
              ))}
              {!loading && !findings.length && !error && (
                <p className="text-[13px] text-on-surface-variant">No findings available yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Ask questions card */}
        <div className="bg-white ghost-border-solid rounded-card p-5">
          <h3 className="font-semibold text-[15px] text-on-surface tracking-tight mb-4">Ask Questions About This Document</h3>
          <div className="flex items-center gap-3 bg-surface-low rounded-btn px-4 py-3 ghost-border mb-4">
            <input
              type="text"
              placeholder="Ask a question about Annual_Report_2024.pdf..."
              className="flex-1 bg-transparent text-[14px] text-on-surface placeholder-outline outline-none"
              id="doc-question-input"
            />
            <button className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center hover:bg-accent transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                className="px-3 py-1.5 bg-surface-container text-on-surface-variant text-[12px] rounded-btn hover:bg-primary-fixed hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
