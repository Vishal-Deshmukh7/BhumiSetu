import { useEffect, useState } from 'react'
import { API_BASE } from '../../config'

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function HearingTimeline({ hearings }) {
  if (!hearings?.length) return <div className="text-sm text-lo-textSecondary p-4">No hearing records available.</div>

  const grouped = hearings.reduce((acc, h) => {
    const d = new Date(h.date)
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
    if (!acc[key]) acc[key] = []
    acc[key].push(h)
    return acc
  }, {})

  const statusStyles = {
    'Completed': { dot: 'bg-lo-emerald', ring: 'ring-lo-emeraldLight', label: 'text-lo-emerald' },
    'Upcoming': { dot: 'bg-lo-amber', ring: 'ring-lo-amberLight', label: 'text-lo-amber' },
    'Scheduled': { dot: 'bg-lo-teal', ring: 'ring-lo-tealLight', label: 'text-lo-teal' },
    'Postponed': { dot: 'bg-lo-red', ring: 'ring-lo-redLight', label: 'text-lo-red' },
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-100" />
      {Object.entries(grouped).map(([month, monthHearings]) => (
        <div key={month} className="mb-6 last:mb-0">
          <div className="flex items-center gap-3 mb-3 relative">
            <div className="h-8 w-8 rounded-full bg-lo-navy text-white text-[10px] font-bold flex items-center justify-center z-10">{month.split(' ')[0].charAt(0)}</div>
            <div className="text-xs font-bold text-lo-navy uppercase tracking-wider">{month}</div>
          </div>
          <div className="ml-4 space-y-3">
            {monthHearings.map((hearing) => {
              const style = statusStyles[hearing.status] || statusStyles.Scheduled
              return (
                <div key={hearing.hearingId} className={`relative pl-6 before:content-[''] before:absolute before:left-[-4px] before:top-3 before:h-2.5 before:w-2.5 before:rounded-full before:ring-4 before:${style.ring} before:${style.dot} z-10`}>
                  <div className="lo-card p-4 hover:border-lo-teal/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm font-bold text-lo-navy">{new Date(hearing.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${style.label} ${
                        hearing.status === 'Completed' ? 'bg-lo-emeraldLight' :
                        hearing.status === 'Upcoming' ? 'bg-lo-amberLight' :
                        'bg-lo-tealLight'
                      }`}>{hearing.status}</span>
                    </div>
                    <div className="text-xs font-semibold text-lo-textSecondary">{hearing.type}</div>
                    <div className="text-xs text-lo-textMuted mt-1">{hearing.time} &middot; {hearing.venue}</div>
                    <div className="text-xs text-lo-textSecondary mt-2 leading-relaxed">{hearing.description}</div>
                    {hearing.outcome && (
                      <div className="mt-2 p-2 rounded-lg bg-lo-emeraldLight/30 text-xs text-lo-navy">
                        <span className="font-semibold">Recorded outcome:</span> {hearing.outcome}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LandownerDisputesPage() {
  const [disputes, setDisputes] = useState([])
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [hearings, setHearings] = useState([])
  const [aiLoading, setAiLoading] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/landowner/disputes`)
      .then((res) => res.json())
      .then((data) => {
        setDisputes(data.disputes || [])
        if (data.disputes?.length > 0) {
          setSelectedDispute(data.disputes[0])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedDispute) return
    fetch(`${API_BASE}/landowner/disputes/${selectedDispute.disputeId}/hearings`)
      .then((res) => res.json())
      .then((data) => setHearings(data.hearings || []))
  }, [selectedDispute])

  const explainHearing = (hearingId) => {
    setAiLoading(hearingId)
    setAiError('')
    fetch(`${API_BASE}/landowner/ai/hearing-explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hearingId }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(err.error || err.message || 'AI request failed') })
        return res.json()
      })
      .then(setAiResult)
      .catch((err) => setAiError(err.message || 'AI explanation failed.'))
      .finally(() => setAiLoading(''))
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 border-2 border-lo-teal border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <header className="lo-animate-in">
        <div className="text-xs font-semibold uppercase tracking-wider text-lo-teal mb-2">Feature</div>
        <h1 className="text-2xl font-bold text-lo-navy md:text-3xl">Dispute &amp; Hearing Tracker</h1>
        <p className="text-sm text-lo-textSecondary mt-1">Track your active disputes, hearing schedule, and case progress.</p>
      </header>

      {disputes.length === 0 ? (
        <div className="lo-card p-12 text-center">
          <div className="text-3xl mb-3">&#9989;</div>
          <div className="text-lg font-bold text-lo-navy mb-1">No Active Disputes</div>
          <div className="text-sm text-lo-textSecondary">You currently have no active land acquisition disputes.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-lo-navy">Active Disputes</h2>
            {disputes.map((d) => (
              <button
                key={d.disputeId}
                type="button"
                onClick={() => { setSelectedDispute(d); setAiResult(null) }}
                className={`lo-card w-full text-left p-4 transition-all ${selectedDispute?.disputeId === d.disputeId ? 'border-lo-teal ring-1 ring-lo-teal/20' : 'hover:border-lo-teal/30'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-sm font-bold text-lo-navy">{d.disputeId}</div>
                  <span className="text-[10px] font-bold text-lo-red bg-lo-redLight px-2 py-0.5 rounded-full">{d.status}</span>
                </div>
                <div className="text-xs text-lo-textSecondary">{d.disputeType}</div>
                <div className="text-[10px] text-lo-textMuted mt-1">{d.parcelId} &middot; {d.authority}</div>
                <div className="text-[10px] text-lo-textMuted mt-1">Stage: {d.currentStage}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedDispute && (
              <>
                <div className="lo-card p-6 lo-animate-in">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-1">Dispute Details</div>
                      <h2 className="text-xl font-bold text-lo-navy">{selectedDispute.disputeId}</h2>
                    </div>
                    <span className="text-xs font-bold text-lo-amber bg-lo-amberLight px-3 py-1 rounded-full">{selectedDispute.judicialStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <InfoTile label="Reference" value={selectedDispute.disputeReference} />
                    <InfoTile label="Filed" value={selectedDispute.filingDate} />
                    <InfoTile label="Parcel" value={selectedDispute.parcelId} />
                    <InfoTile label="Court" value={selectedDispute.authority} />
                  </div>
                  <div className="text-xs text-lo-textSecondary leading-relaxed p-3 rounded-lg bg-gray-50 border border-gray-100">
                    {selectedDispute.disputeSummary}
                  </div>
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold text-lo-textMuted mb-1">Parties</div>
                    {selectedDispute.parties.map((p, i) => (
                      <div key={i} className="text-xs text-lo-textSecondary">{p}</div>
                    ))}
                  </div>
                </div>

                <div className="lo-card p-6 lo-animate-in lo-animate-delay-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-4">Hearing Timeline</div>
                  <HearingTimeline hearings={hearings} />
                </div>

                <div className="lo-card p-5 lo-animate-in lo-animate-delay-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-3" style={{ letterSpacing: '0.08em' }}>AI Hearing Explanation</div>
                  <div className="text-[10px] text-lo-textMuted mb-3">Select a completed hearing to get a plain-language explanation.</div>
                  <div className="flex gap-2 flex-wrap">
                    {hearings.filter((h) => h.status === 'Completed').map((h) => (
                      <button key={h.hearingId} type="button" onClick={() => explainHearing(h.hearingId)} disabled={aiLoading === h.hearingId} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-lo-teal text-lo-teal hover:bg-lo-tealLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {aiLoading === h.hearingId ? (
                          <span className="flex items-center gap-1.5">
                            <span className="h-3 w-3 border-2 border-lo-teal border-t-transparent rounded-full animate-spin" />
                            Explaining...
                          </span>
                        ) : `Explain ${new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </button>
                    ))}
                  </div>
                  {aiError && (
                    <div className="mt-3 p-3 rounded-lg border border-lo-red/30 bg-lo-redLight/30 text-xs text-lo-navy">
                      <span className="font-bold">Error:</span> {aiError}
                    </div>
                  )}
                  {aiResult?.ai && (
                    <div className="mt-4 p-4 rounded-xl bg-white border border-lo-border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs font-bold text-lo-navy">AI Summary</div>
                        {aiResult.hearing && <span className="text-[10px] text-lo-textMuted">{aiResult.hearing.date}</span>}
                      </div>
                      {aiResult.ai.summary && <p className="text-sm text-lo-textSecondary leading-relaxed mb-2">{aiResult.ai.summary}</p>}
                      {aiResult.ai.plainLanguage && <p className="text-xs text-lo-textMuted italic">{aiResult.ai.plainLanguage}</p>}
                      {aiResult.ai.nextSteps && (
                        <div className="mt-2 p-2 rounded-lg bg-lo-tealLight/30 text-xs text-lo-navy">
                          <span className="font-semibold">Next steps:</span> {aiResult.ai.nextSteps}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedDispute.documents?.length > 0 && (
                  <div className="lo-card p-5 lo-animate-in lo-animate-delay-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-3">Case Documents</div>
                    <div className="space-y-2">
                      {selectedDispute.documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 text-xs">
                          <svg className="h-4 w-4 text-lo-teal shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                          <span className="text-lo-textSecondary">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoTile({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
      <div className="text-[10px] text-lo-textMuted mb-1">{label}</div>
      <div className="text-xs font-semibold text-lo-navy break-words">{value || '—'}</div>
    </div>
  )
}
