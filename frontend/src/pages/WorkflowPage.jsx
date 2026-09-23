import { useMemo, useState } from 'react'
import { API_BASE } from '../config'

const steps = [
  'Land Claim',
  'Document Analysis',
  'Record Verification',
  'Consistency Analysis',
  'Conflict Classification',
  'Risk / Workflow Status',
  'Claim Graph',
  'Verification Report',
]

const demoCases = [
  { value: 'matching', label: 'Matching record' },
  { value: 'owner-mismatch', label: 'Owner mismatch' },
  { value: 'area-mutation-mismatch', label: 'Area + mutation mismatch' },
  { value: 'internal-inconsistency', label: 'Internal document inconsistency' },
  { value: 'duplicate-acquisition', label: 'Duplicate acquisition signal' },
]

const statusStyles = {
  matched: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  discrepancy: 'bg-rose-50 text-rose-700 border-rose-200',
  missing: 'bg-amber-50 text-amber-700 border-amber-200',
  review: 'bg-amber-50 text-amber-700 border-amber-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function Badge({ status = 'review' }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusStyles[status] || statusStyles.review}`}>{status.replace(/-/g, ' ')}</span>
}

function Graph({ graph }) {
  if (!graph?.nodes?.length) return <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">The claim graph will appear after verification.</div>
  const positions = {
    claim: [70, 100],
    documents: [230, 100],
    parcel: [390, 100],
    record: [550, 100],
    review: [710, 100],
  }
  const conflicts = graph.nodes.filter((node) => node.type === 'conflict')
  conflicts.forEach((node, index) => { positions[node.id] = [390 + (index % 2) * 180, 220 + Math.floor(index / 2) * 90] })
  const point = (id) => positions[id] || [70, 320]
  return (
    <div className="overflow-x-auto rounded-2xl border border-bhumisetu-forest/10 bg-[#fbfcf8] p-3">
      <svg viewBox="0 0 800 380" className="h-[300px] min-w-[700px] w-full" role="img" aria-label="Interactive claim relationship graph">
        <defs>
          <marker id="claim-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#668275" /></marker>
        </defs>
        {graph.edges.map((edge) => {
          const [x1, y1] = point(edge.source)
          const [x2, y2] = point(edge.target)
          return <g key={edge.id}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9bb0a3" strokeWidth="2" markerEnd="url(#claim-arrow)" /><text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} textAnchor="middle" className="fill-gray-500 text-[10px]">{edge.label}</text></g>
        })}
        {graph.nodes.map((node) => {
          const [x, y] = point(node.id)
          const alert = node.type === 'conflict'
          return <g key={node.id}><rect x={x - 62} y={y - 25} width="124" height="50" rx="12" fill={alert ? '#fff3e8' : '#ffffff'} stroke={alert ? '#d97706' : '#6c8977'} strokeWidth="2" /><text x={x} y={y - 2} textAnchor="middle" className="fill-bhumisetu-darkest text-[11px] font-semibold">{node.label.slice(0, 20)}</text><text x={x} y={y + 14} textAnchor="middle" className="fill-gray-500 text-[9px]">{node.status}</text></g>
        })}
      </svg>
    </div>
  )
}

export default function WorkflowPage() {
  const [files, setFiles] = useState([])
  const [parcelId, setParcelId] = useState('PAR-1000')
  const [surveyNumber, setSurveyNumber] = useState('')
  const [demoCase, setDemoCase] = useState('matching')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activeStep = result ? 8 : 1
  const report = result?.report
  const fields = result?.fieldComparisons || report?.recordVerification?.fieldComparisons || []
  const graph = result?.graph || report?.claimGraph
  const conflicts = result?.conflicts || report?.conflictClassification || []
  const indicatorEntries = useMemo(() => Object.entries(result?.integrityIndicators || report?.integrityIndicators || {}), [result, report])

  async function submitClaim(event) {
    event.preventDefault()
    setError('')
    if (!files.length) {
      setError('Select at least one PDF, JPG, or PNG document.')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('documents', file))
      formData.append('claim', JSON.stringify({ parcelId, surveyNumber, demoCase }))
      const response = await fetch(`${API_BASE}/claims/verify`, { method: 'POST', body: formData })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Verification could not be completed.')
      setResult(payload)
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-bhumisetu-muted">Multilayer verification engine</div>
          <h1 className="font-display text-4xl leading-tight text-bhumisetu-darkest md:text-5xl">Land claim verification</h1>
          <p className="mt-3 max-w-2xl font-body text-gray-600">Trace a claim from document evidence to record comparison, review signals and a transparent verification report.</p>
        </div>
        <div className="rounded-2xl border border-bhumisetu-forest/15 bg-white px-5 py-4 shadow-subtle">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Prototype scope</div>
          <div className="mt-1 font-display text-lg text-bhumisetu-forest">Decision support · synthetic records</div>
        </div>
      </header>

      <section className="grid gap-2 overflow-x-auto rounded-2xl border border-bhumisetu-forest/10 bg-white p-3 shadow-subtle md:grid-cols-8">
        {steps.map((step, index) => {
          const complete = result && index < activeStep - 1
          const current = index === activeStep - 1
          return <div key={step} className={`min-w-[125px] rounded-xl px-3 py-3 ${current ? 'bg-bhumisetu-darkest text-white' : complete ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-50 text-gray-500'}`}><div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{String(index + 1).padStart(2, '0')}</div><div className="mt-1 text-xs font-semibold leading-tight">{step}</div></div>
        })}
      </section>

      <form onSubmit={submitClaim} className="rounded-2xl border border-bhumisetu-forest/15 bg-white p-5 shadow-subtle md:p-7">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div><h2 className="font-display text-2xl text-bhumisetu-darkest">Start a land claim</h2><p className="mt-1 text-sm text-gray-500">Upload source documents and choose a synthetic demo case to exercise each verification layer.</p></div>
          <div className="rounded-full bg-bhumisetu-cream px-3 py-1 text-xs font-semibold text-bhumisetu-forest">POST /api/claims/verify</div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <label className="space-y-2 text-sm font-semibold text-gray-700">Parcel identifier<input value={parcelId} onChange={(event) => setParcelId(event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-3 font-normal outline-none focus:border-bhumisetu-brass" placeholder="PAR-1000" /></label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">Survey number<input value={surveyNumber} onChange={(event) => setSurveyNumber(event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-3 font-normal outline-none focus:border-bhumisetu-brass" placeholder="40/2A (optional)" /></label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">Demo case<select value={demoCase} onChange={(event) => setDemoCase(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal outline-none focus:border-bhumisetu-brass">{demoCases.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
        <label className="mt-5 block cursor-pointer rounded-2xl border-2 border-dashed border-bhumisetu-muted/50 bg-bhumisetu-cream/50 p-6 text-center transition hover:border-bhumisetu-brass">
          <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={(event) => setFiles([...event.target.files])} className="sr-only" />
          <div className="font-display text-xl text-bhumisetu-darkest">Drop claim documents here</div>
          <div className="mt-1 text-sm text-gray-500">PDF, JPG or PNG · up to 10 MB each · one or more files</div>
          {files.length > 0 && <div className="mt-3 text-sm font-semibold text-bhumisetu-forest">{files.length} file{files.length === 1 ? '' : 's'} selected: {files.map((file) => file.name).join(', ')}</div>}
        </label>
        {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <button type="submit" disabled={loading} className="mt-5 rounded-xl bg-bhumisetu-darkest px-5 py-3 text-sm font-semibold text-white transition hover:bg-bhumisetu-forest disabled:cursor-wait disabled:opacity-60">{loading ? 'Analysing claim…' : 'Run multilayer verification'}</button>
      </form>

      {result && (
        <>
          <section className="grid gap-5 md:grid-cols-4">
            <div className="rounded-2xl bg-bhumisetu-darkest p-5 text-white"><div className="text-xs uppercase tracking-wider text-white/60">Claim ID</div><div className="mt-2 break-all font-display text-xl">{result.claimId}</div><div className="mt-2 text-xs text-white/60">{result.persistence?.mode} persistence</div></div>
            <div className="rounded-2xl border border-bhumisetu-forest/15 bg-white p-5"><div className="text-xs uppercase tracking-wider text-gray-500">Workflow</div><div className="mt-2 font-display text-xl text-bhumisetu-forest">{result.workflowStatus?.overall}</div><div className="mt-2 text-xs text-gray-500">{result.workflowStatus?.nextAction}</div></div>
            <div className="rounded-2xl border border-bhumisetu-forest/15 bg-white p-5"><div className="text-xs uppercase tracking-wider text-gray-500">Review signals</div><div className="mt-2 font-display text-4xl text-amber-600">{conflicts.length}</div><div className="mt-2 text-xs text-gray-500">Across document and record layers</div></div>
            <div className="rounded-2xl border border-bhumisetu-forest/15 bg-white p-5"><div className="text-xs uppercase tracking-wider text-gray-500">Integrity</div><div className="mt-2 font-display text-2xl text-bhumisetu-forest">{result.integrityIndicators?.internalConsistency || 'not-tested'}</div><div className="mt-2 text-xs text-gray-500">Synthetic data notice applies</div></div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-2xl border border-bhumisetu-forest/15 bg-white p-5 shadow-subtle md:p-7"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-2xl text-bhumisetu-darkest">Field-level record comparison</h2><p className="mt-1 text-sm text-gray-500">Submitted values are compared with the synthetic land record snapshot.</p></div><Badge status={conflicts.length ? 'review' : 'matched'} /></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-3 py-3">Field</th><th className="px-3 py-3">Submitted</th><th className="px-3 py-3">Record</th><th className="px-3 py-3">Result</th></tr></thead><tbody>{fields.map((field) => <tr key={field.field} className="border-b border-gray-100 last:border-0"><td className="px-3 py-3 font-semibold text-gray-700">{field.field}</td><td className="px-3 py-3 text-gray-600">{String(field.submitted)}</td><td className="px-3 py-3 text-gray-600">{String(field.registered)}</td><td className="px-3 py-3"><Badge status={field.status} /></td></tr>)}</tbody></table></div></div>
            <div className="rounded-2xl border border-bhumisetu-forest/15 bg-white p-5 shadow-subtle md:p-7"><h2 className="font-display text-2xl text-bhumisetu-darkest">Integrity indicators</h2><div className="mt-5 space-y-3">{indicatorEntries.map(([key, value]) => <div key={key} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 text-sm last:border-0"><span className="capitalize text-gray-500">{key.replace(/([A-Z])/g, ' $1')}</span><span className="max-w-[58%] text-right font-semibold text-bhumisetu-darkest">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span></div>)}</div></div>
          </section>

          <section className="rounded-2xl border border-bhumisetu-forest/15 bg-white p-5 shadow-subtle md:p-7"><h2 className="font-display text-2xl text-bhumisetu-darkest">Conflict classification</h2>{conflicts.length ? <div className="mt-5 grid gap-3 md:grid-cols-2">{conflicts.map((conflict) => <div key={`${conflict.type}-${conflict.message}`} className="rounded-xl border border-amber-200 bg-amber-50/60 p-4"><div className="flex items-center justify-between gap-3"><div className="font-semibold capitalize text-amber-900">{conflict.type.replace(/-/g, ' ')}</div><Badge status="review" /></div><p className="mt-2 text-sm text-amber-900/75">{conflict.message}</p></div>)}</div> : <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No synthetic comparison conflicts detected. Continue with authorised review.</div>}</section>

          <section className="rounded-2xl border border-bhumisetu-forest/15 bg-white p-5 shadow-subtle md:p-7"><div className="mb-5"><h2 className="font-display text-2xl text-bhumisetu-darkest">Claim graph</h2><p className="mt-1 text-sm text-gray-500">A lightweight relationship view of the claim, evidence, record and review signals.</p></div><Graph graph={graph} /></section>

          <section className="rounded-2xl border border-bhumisetu-darkest/10 bg-bhumisetu-darkest p-5 text-white shadow-subtle md:p-7"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-bhumisetu-brass">Verification report</div><h2 className="mt-2 font-display text-3xl">{report?.title}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">{report?.summary}</p></div><Badge status={conflicts.length ? 'review' : 'matched'} /></div><div className="mt-6 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-3"><div><div className="text-xs uppercase tracking-wider text-white/50">Documents analysed</div><div className="mt-1 font-display text-2xl">{report?.documentAnalysis?.documentsAnalysed}</div></div><div><div className="text-xs uppercase tracking-wider text-white/50">Internal consistency</div><div className="mt-1 font-display text-2xl">{report?.consistencyAnalysis?.status}</div></div><div><div className="text-xs uppercase tracking-wider text-white/50">Prototype safeguard</div><div className="mt-1 text-sm text-white/70">No legal ownership or forgery determination is made.</div></div></div></section>
        </>
      )}
    </div>
  )
}
