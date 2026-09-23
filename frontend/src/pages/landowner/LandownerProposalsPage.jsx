import { useEffect, useState } from 'react'
import { API_BASE } from '../../config'

function CompareRow({ label, values, highlight = false }) {
  return (
    <div className={`grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] gap-2 py-3 border-b border-gray-50 last:border-0 ${highlight ? 'bg-lo-amberLight/20 -mx-4 px-4 rounded-lg' : ''}`}>
      <div className="text-xs font-medium text-lo-textMuted">{label}</div>
      {values.map((v, i) => (
        <div key={i} className="text-sm font-medium text-lo-navy text-right">{v || '—'}</div>
      ))}
    </div>
  )
}

function PaymentTimeline({ schedule }) {
  if (!schedule?.length) return null
  return (
    <div className="mt-3 space-y-2">
      {schedule.map((item, i) => (
        <div key={i} className="flex items-center gap-3 text-xs">
          <div className={`h-2 w-2 rounded-full shrink-0 ${item.status === 'Paid' ? 'bg-lo-emerald' : 'bg-gray-300'}`} />
          <div className="flex-1 min-w-0">
            <span className="text-lo-textSecondary">{item.label}</span>
            <span className="text-lo-textMuted ml-2">{item.date}</span>
          </div>
          <div className="text-lo-navy font-semibold">Rs {item.amount} Cr</div>
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'Paid' ? 'bg-lo-emeraldLight text-lo-emerald' : 'bg-gray-100 text-gray-500'}`}>{item.status}</div>
        </div>
      ))}
    </div>
  )
}

export default function LandownerProposalsPage() {
  const [data, setData] = useState(null)
  const [selectedParcel, setSelectedParcel] = useState('PAR-1000')
  const [aiLoading, setAiLoading] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/landowner/proposals`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const fetchComparison = (parcelId) => {
    setSelectedParcel(parcelId)
    setAiResult(null)
    fetch(`${API_BASE}/landowner/proposals/compare?parcelId=${encodeURIComponent(parcelId)}`)
      .then((res) => res.json())
      .then(setData)
  }

  const explainProposal = (proposalId) => {
    setAiLoading(proposalId)
    setAiError('')
    setAiResult(null)
    fetch(`${API_BASE}/landowner/ai/proposal-explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId }),
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

  const proposals = data?.proposals || []
  const parcel = data?.parcel
  const parcels = [...new Set(proposals.map((p) => p.parcelId))]

  return (
    <div className="space-y-6">
      <header className="lo-animate-in">
        <div className="text-xs font-semibold uppercase tracking-wider text-lo-teal mb-2">Feature</div>
        <h1 className="text-2xl font-bold text-lo-navy md:text-3xl">Compare Acquisition Proposals</h1>
        <p className="text-sm text-lo-textSecondary mt-1">Review and compare proposals from different authorities for your land.</p>
      </header>

      {parcels.length > 1 && (
        <div className="lo-card p-4 lo-animate-in lo-animate-delay-1">
          <div className="text-xs font-semibold text-lo-textMuted mb-2">Select parcel to compare</div>
          <div className="flex gap-2 flex-wrap">
            {parcels.map((pid) => (
              <button key={pid} type="button" onClick={() => fetchComparison(pid)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedParcel === pid ? 'bg-lo-teal text-white' : 'bg-gray-100 text-lo-textSecondary hover:bg-gray-200'}`}>{pid}</button>
            ))}
          </div>
        </div>
      )}

      {parcel && (
        <div className="lo-card p-5 lo-animate-in lo-animate-delay-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-1">Parcel</div>
          <div className="text-lg font-bold text-lo-navy">Survey {parcel.surveyNumber} &middot; {parcel.village}, {parcel.district}</div>
          <div className="text-sm text-lo-textSecondary">{parcel.area} hectares</div>
        </div>
      )}

      {proposals.length < 2 ? (
        <div className="lo-card p-8 text-center text-lo-textSecondary text-sm">
          {proposals.length === 0 ? 'No proposals found for this parcel.' : 'Only one proposal available for this parcel.'}
        </div>
      ) : (
        <div className="lo-card overflow-hidden lo-animate-in lo-animate-delay-2">
          <div className="p-5 border-b border-lo-border">
            <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted">Side-by-side comparison</div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] gap-2 px-5 py-3 bg-gray-50 border-b border-lo-border">
                <div className="text-xs font-semibold text-lo-textMuted" />
                {proposals.map((p, i) => (
                  <div key={i} className="text-right">
                    <div className="text-xs font-bold text-lo-navy">Proposal {String.fromCharCode(65 + i)}</div>
                    <div className="text-[10px] text-lo-textMuted mt-0.5">{p.authority}</div>
                  </div>
                ))}
              </div>

              <div className="px-5 divide-y divide-gray-50">
                <CompareRow label="Project" values={proposals.map((p) => p.projectName)} />
                <CompareRow label="Purpose" values={proposals.map((p) => p.purpose)} />
                <CompareRow label="Total Compensation" values={proposals.map((p) => `Rs ${p.totalCompensation} Cr`)} highlight />
                <CompareRow label="Initial Payment" values={proposals.map((p) => `Rs ${p.initialPayment} Cr`)} />
                <CompareRow label="Remaining" values={proposals.map((p) => `Rs ${p.remainingPayment} Cr`)} />
                <CompareRow label="Installments" values={proposals.map((p) => String(p.installments))} />
                <CompareRow label="Payment Status" values={proposals.map((p) => p.paymentStatus)} />
                <CompareRow label="Completion Est." values={proposals.map((p) => p.estimatedCompletion)} />
                <CompareRow label="Possession Date" values={proposals.map((p) => p.possessionDate)} />
                <CompareRow label="Stage" values={proposals.map((p) => p.acquisitionStage)} />
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-lo-border space-y-4">
            {proposals.map((p, i) => (
              <div key={i}>
                <div className="text-xs font-semibold text-lo-textMuted mb-2">Payment Schedule — Proposal {String.fromCharCode(65 + i)}</div>
                <PaymentTimeline schedule={p.paymentSchedule} />
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-lo-border">
            <div className="text-xs font-semibold text-lo-textMuted mb-2">Conditions & Notes</div>
            {proposals.map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="text-xs font-bold text-lo-navy mb-1">Proposal {String.fromCharCode(65 + i)}</div>
                <ul className="space-y-1">
                  {p.conditions?.map((c, j) => (
                    <li key={j} className="text-xs text-lo-textSecondary flex items-start gap-1.5">
                      <span className="text-lo-teal mt-0.5">*</span>{c}
                    </li>
                  ))}
                </ul>
                {p.notes && <div className="text-[10px] text-lo-textMuted mt-1 italic">{p.notes}</div>}
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-lo-border bg-gray-50/50">
            <div className="text-xs font-semibold text-lo-textMuted mb-3" style={{ letterSpacing: '0.06em' }}>AI Explanation (neutral, factual only)</div>
            <div className="flex gap-2 flex-wrap">
              {proposals.map((p, i) => (
                <button key={i} type="button" onClick={() => explainProposal(p.proposalId)} disabled={aiLoading === p.proposalId} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-lo-teal text-lo-teal hover:bg-lo-tealLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {aiLoading === p.proposalId ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 border-2 border-lo-teal border-t-transparent rounded-full animate-spin" />
                      Explaining...
                    </span>
                  ) : `Explain Proposal ${String.fromCharCode(65 + i)}`}
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
                <div className="text-xs font-semibold text-lo-navy mb-2">AI Explanation</div>
                <p className="text-sm text-lo-textSecondary leading-relaxed">{aiResult.ai.explanation}</p>
                {aiResult.ai.keyPoints?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-lo-textMuted mb-1">Key Points</div>
                    <ul className="space-y-1">
                      {aiResult.ai.keyPoints.map((point, i) => (
                        <li key={i} className="text-xs text-lo-textSecondary flex items-start gap-1.5">
                          <span className="text-lo-teal mt-0.5">-</span>{point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiResult.ai.considerations?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-lo-textMuted mb-1">Considerations</div>
                    <ul className="space-y-1">
                      {aiResult.ai.considerations.map((c, i) => (
                        <li key={i} className="text-xs text-lo-textSecondary flex items-start gap-1.5">
                          <span className="text-lo-amber mt-0.5">*</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="lo-card p-4 lo-animate-in lo-animate-delay-3">
        <div className="text-[10px] text-lo-textMuted text-center">
          All data shown is synthetic demonstration data. Compensation amounts, proposals, and timelines are fabricated for prototype UI demonstration.
        </div>
      </div>
    </div>
  )
}
