import { useEffect, useState, useCallback } from 'react'
import { API_BASE } from '../../config'

const categoryIcons = {
  '7/12 Extract': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  'Sale Deed': 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  'Acquisition Notice': 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  'Compensation Document': 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  'Asset Assessment': 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  'NOC': 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  'Court Document': 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  'Ownership Certificate': 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z',
}

function DocumentPreviewModal({ doc, onClose }) {
  if (!doc) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-lo-navy/60 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-lo-border">
          <div>
            <div className="text-sm font-bold text-lo-navy">{doc.name}</div>
            <div className="text-xs text-lo-textMuted mt-0.5">{doc.category} &middot; {doc.documentType}</div>
          </div>
          <button type="button" onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-lo-textMuted hover:bg-gray-100 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {doc.isAuthoritative ? (
                <span className="text-[10px] font-bold text-lo-emerald bg-lo-emeraldLight px-2 py-0.5 rounded-full">Authoritative Source Document</span>
              ) : (
                <span className="text-[10px] font-bold text-lo-textMuted bg-gray-100 px-2 py-0.5 rounded-full">Reference Document</span>
              )}
              <span className="text-[10px] font-bold text-lo-textMuted bg-gray-100 px-2 py-0.5 rounded-full">{doc.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Document Date</div>
                <div className="text-sm font-semibold text-lo-navy">{doc.date}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Last Updated</div>
                <div className="text-sm font-semibold text-lo-navy">{doc.lastUpdated}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Source</div>
                <div className="text-sm font-semibold text-lo-navy">{doc.source}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Linked Parcel</div>
                <div className="text-sm font-semibold text-lo-navy">{doc.parcelId}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Type</div>
                <div className="text-sm font-semibold text-lo-navy">{doc.documentType}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Uploaded</div>
                <div className="text-sm font-semibold text-lo-navy">{doc.uploadedAt}</div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-center">
              <svg className="h-10 w-10 mx-auto text-lo-textMuted mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              <div className="text-sm font-semibold text-lo-navy mb-1">Document Preview</div>
              <div className="text-xs text-lo-textMuted">This is a synthetic demonstration document. In production, a PDF/image preview would render here.</div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lo-tealLight text-xs font-semibold text-lo-teal">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                Open in new tab (demo)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentCard({ doc, onExplain, onPreview, aiLoading }) {
  return (
    <div className="lo-card p-5 hover:border-lo-teal/30 transition-all lo-animate-in">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-lo-tealLight flex items-center justify-center shrink-0">
          <svg className="h-5 w-5 text-lo-teal" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcons[doc.category] || categoryIcons['7/12 Extract']} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-lo-navy break-words">{doc.name}</div>
          <div className="text-[10px] text-lo-textMuted mt-0.5">{doc.category}</div>
        </div>
        <AuthorityBadge isAuthoritative={doc.isAuthoritative} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div><span className="text-lo-textMuted">Date: </span><span className="text-lo-navy font-medium">{doc.date}</span></div>
        <div><span className="text-lo-textMuted">Updated: </span><span className="text-lo-navy font-medium">{doc.lastUpdated}</span></div>
        <div><span className="text-lo-textMuted">Source: </span><span className="text-lo-navy font-medium">{doc.source}</span></div>
        <div><span className="text-lo-textMuted">Parcel: </span><span className="text-lo-navy font-medium">{doc.parcelId}</span></div>
      </div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <button type="button" onClick={() => onExplain(doc.documentId)} disabled={aiLoading === doc.documentId} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold border border-lo-teal text-lo-teal hover:bg-lo-tealLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {aiLoading === doc.documentId ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 border-2 border-lo-teal border-t-transparent rounded-full animate-spin" />
              Explaining...
            </span>
          ) : 'AI Explain'}
        </button>
        {doc.previewAvailable && (
          <button type="button" onClick={() => onPreview(doc)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-lo-navy text-white hover:bg-lo-slate transition-colors">
            View Preview
          </button>
        )}
      </div>
    </div>
  )
}

function AuthorityBadge({ isAuthoritative }) {
  if (isAuthoritative) {
    return <span className="text-[10px] font-bold text-lo-emerald bg-lo-emeraldLight px-2 py-0.5 rounded-full shrink-0">Authoritative</span>
  }
  return <span className="text-[10px] font-bold text-lo-textMuted bg-gray-100 px-2 py-0.5 rounded-full shrink-0">Reference</span>
}

export default function LandownerDocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [filter, setFilter] = useState('all')
  const [aiLoading, setAiLoading] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/landowner/documents`)
      .then((res) => res.json())
      .then((data) => setDocuments(data.documents || []))
      .finally(() => setLoading(false))
  }, [])

  const explainDocument = useCallback((documentId) => {
    setAiLoading(documentId)
    setAiError('')
    setAiResult(null)
    fetch(`${API_BASE}/landowner/ai/document-explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(err.error || err.message || 'AI request failed') })
        return res.json()
      })
      .then((data) => {
        if (data.ai) {
          setAiResult(data)
        } else {
          setAiError(data.error || 'AI returned no explanation.')
        }
      })
      .catch((err) => {
        setAiError(err.message || 'AI explanation failed. Please try again.')
      })
      .finally(() => setAiLoading(''))
  }, [])

  const categories = [...new Set(documents.map((d) => d.category))]
  const filtered = filter === 'all' ? documents : documents.filter((d) => d.category === filter)

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 border-2 border-lo-teal border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <header className="lo-animate-in">
        <div className="text-xs font-semibold uppercase tracking-wider text-lo-teal mb-2" style={{ letterSpacing: '0.08em' }}>Feature</div>
        <h1 className="text-2xl font-bold text-lo-navy md:text-3xl">Document Vault</h1>
        <p className="text-sm text-lo-textSecondary mt-1">Access important documents related to your land and acquisition case.</p>
      </header>

      <div className="lo-card p-4 lo-animate-in lo-animate-delay-1">
        <div className="text-xs font-semibold text-lo-textMuted mb-2" style={{ letterSpacing: '0.06em' }}>Filter by category</div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-lo-teal text-white' : 'bg-gray-100 text-lo-navy hover:bg-gray-200'}`}>All ({documents.length})</button>
          {categories.map((cat) => (
            <button key={cat} type="button" onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === cat ? 'bg-lo-teal text-white' : 'bg-gray-100 text-lo-navy hover:bg-gray-200'}`}>{cat} ({documents.filter((d) => d.category === cat).length})</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc, i) => (
          <div key={doc.documentId} style={{ animationDelay: `${i * 0.05}s` }}>
            <DocumentCard doc={doc} onExplain={explainDocument} onPreview={setPreviewDoc} aiLoading={aiLoading} />
          </div>
        ))}
      </div>

      {aiError && (
        <div className="lo-card p-5 border-lo-red/30 bg-lo-redLight/30 lo-animate-in">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-lo-red shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            <div>
              <div className="text-sm font-bold text-lo-navy">AI Explanation Failed</div>
              <div className="text-xs text-lo-textSecondary mt-1">{aiError}</div>
              <button type="button" onClick={() => setAiError('')} className="mt-2 text-xs font-semibold text-lo-teal hover:text-lo-navy transition-colors">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {aiResult?.ai && (
        <div className="lo-card p-6 border-lo-teal/20 bg-lo-tealLight/10 lo-animate-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-md bg-lo-teal flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
            </div>
            <div className="text-xs font-bold text-lo-navy" style={{ letterSpacing: '0.06em' }}>AI Document Explanation</div>
          </div>
          <p className="text-sm text-lo-textSecondary leading-relaxed" style={{ letterSpacing: '0.01em' }}>{aiResult.ai.explanation}</p>
          {aiResult.ai.relevance && (
            <div className="mt-3 p-3 rounded-lg bg-white border border-lo-teal/20 text-xs text-lo-navy">
              <span className="font-bold">Relevance:</span> <span className="text-lo-textSecondary">{aiResult.ai.relevance}</span>
            </div>
          )}
          {aiResult.ai.actionNeeded && (
            <div className="mt-2 p-3 rounded-lg bg-white border border-lo-amber/20 text-xs text-lo-navy">
              <span className="font-bold">Action needed:</span> <span className="text-lo-textSecondary">{aiResult.ai.actionNeeded}</span>
            </div>
          )}
          {aiResult.document && (
            <div className="mt-3 text-[10px] text-lo-textMuted">
              Source: {aiResult.document.name} &middot; {aiResult.document.documentType}
            </div>
          )}
        </div>
      )}

      {previewDoc && <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  )
}
