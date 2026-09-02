import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../config'

const services = [
  { key: 'award', label: 'Award Notice', description: 'Verify acquisition records', icon: '▣', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'compensation', label: 'Compensation Ledger', description: 'Reconcile payment records', icon: '₹', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'rnr', label: 'R&R Checklist', description: 'Monitor rehabilitation & resettlement', icon: '⌂', accept: '.pdf,.jpg,.jpeg,.png' },
]

function StatusPill({ children, tone = 'green' }) {
  const tones = {
    green: 'bg-green-100 text-green-900',
    amber: 'bg-amber-100 text-amber-900',
    red: 'bg-red-100 text-red-900',
    gray: 'bg-gray-100 text-gray-800',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>
}

function ProcessingSteps({ step }) {
  const steps = ['Document received', 'Document type identified', 'Extracting entities', 'Validating system records', 'Generating findings']
  return (
    <div className="rounded-xl border border-bhumisetu-muted/20 bg-bhumisetu-cream/60 p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Analyzing document</div>
      <div className="space-y-3">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${index < step ? 'bg-bhumisetu-forest text-white' : index === step ? 'animate-pulse bg-bhumisetu-brass text-white' : 'bg-gray-200 text-gray-500'}`}>
              {index < step ? '✓' : index + 1}
            </span>
            <span className={index <= step ? 'text-bhumisetu-darkest' : 'text-gray-400'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FamilyResults({ families }) {
  const [expanded, setExpanded] = useState(null)
  return (
    <div className="space-y-3">
      {families.map((family) => {
        const settled = family.overallRnRStatus === 'Settled'
        const inReview = family.overallRnRStatus === 'In Review'
        return (
          <div key={family.familyId} className="overflow-hidden rounded-xl border border-gray-200">
            <button type="button" onClick={() => setExpanded(expanded === family.familyId ? null : family.familyId)} className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-gray-50">
              <div><div className="font-semibold text-bhumisetu-darkest">{family.familyHead}</div><div className="text-xs text-gray-500">{family.familyId} · {family.houseNumber}</div></div>
              <div className="flex items-center gap-3"><StatusPill tone={settled ? 'green' : inReview ? 'amber' : 'red'}>{settled ? '✓ SETTLED' : inReview ? '◌ IN REVIEW' : '× PENDING'}</StatusPill><span>{expanded === family.familyId ? '−' : '+'}</span></div>
            </button>
            {expanded === family.familyId && <div className="grid grid-cols-2 gap-4 border-t border-gray-200 bg-gray-50 p-4 text-sm md:grid-cols-3"><div><b>Family Head</b><br />{family.familyHead}</div><div><b>House</b><br />{family.houseNumber}</div><div><b>Housing</b><br />{family.housingStatus}</div><div><b>Relocation</b><br />{family.relocationStatus}</div><div><b>Livelihood</b><br />{family.livelihoodStatus}</div><div><b>Compensation</b><br />{family.compensationStatus}</div></div>}
          </div>
        )
      })}
    </div>
  )
}

export default function IntelligencePage() {
  const [data, setData] = useState(null)
  const [service, setService] = useState('award')
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/intelligence`).then((res) => res.json()).then(setData).catch(() => setError('Intelligence summary is temporarily unavailable.'))
  }, [])

  const selectedService = services.find((item) => item.key === service)
  const rnrStats = useMemo(() => {
    const families = result?.extractedData?.families || []
    return { total: families.length, settled: families.filter((item) => item.overallRnRStatus === 'Settled').length, review: families.filter((item) => item.overallRnRStatus === 'In Review').length, pending: families.filter((item) => item.overallRnRStatus !== 'Settled' && item.overallRnRStatus !== 'In Review').length }
  }, [result])

  const analyze = async () => {
    if (!file) return
    setProcessing(true); setResult(null); setError(''); setStep(1)
    const timer = setInterval(() => setStep((current) => Math.min(current + 1, 4)), 350)
    try {
      const body = new FormData()
      body.append('document', file)
      const response = await fetch(`${API_BASE}/intelligence/${service}`, { method: 'POST', body })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Document analysis failed.')
      setResult(payload)
      setStep(5)
    } catch (analysisError) {
      setError(analysisError.message)
    } finally {
      clearInterval(timer); setProcessing(false)
    }
  }

  return (
    <div className="space-y-8 p-8">
      <header className="max-w-4xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">AI + Decision Support</div>
        <h1 className="font-display text-5xl leading-tight text-bhumisetu-darkest">Document &amp; Decision Intelligence</h1>
        <p className="text-lg">AI-assisted monitoring for land acquisition. Analyze acquisition documents, reconcile official records, identify exceptions and prioritize administrative intervention.</p>
      </header>

      {data && <section className="grid grid-cols-1 gap-4 md:grid-cols-3"><div className="rounded-2xl bg-bhumisetu-darkest p-6 text-white md:col-span-2"><div className="text-xs uppercase tracking-wider text-bhumisetu-muted">Today's intelligence</div><div className="mt-3 font-display text-3xl">{data.today.projectsRequiringAttention} projects require attention.</div><div className="mt-2 text-sm text-white/70">Compensation processing is currently the largest contributor to acquisition bottlenecks.</div></div><div className="grid grid-cols-3 gap-2 rounded-2xl border border-gray-200 bg-white p-4">{[['Discrepancies', data.today.recordDiscrepancies], ['R&R review', data.today.rnrCasesRequiringReview], ['Documents', data.documents.length]].map(([label, value]) => <div key={label} className="text-center"><div className="font-display text-2xl text-bhumisetu-darkest">{value}</div><div className="text-xs text-gray-500">{label}</div></div>)}</div></section>}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {services.map((item) => <button type="button" key={item.key} onClick={() => { setService(item.key); setResult(null); setFile(null); setError('') }} className={`rounded-2xl border-2 p-5 text-left transition hover:-translate-y-1 hover:shadow-elevated ${service === item.key ? 'border-bhumisetu-brass bg-yellow-50' : 'border-gray-200 bg-white'}`}><div className="mb-4 flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-bhumisetu-forest text-xl text-white">{item.icon}</span>{service === item.key && <StatusPill tone="amber">ACTIVE SERVICE</StatusPill>}</div><div className="font-display text-xl text-bhumisetu-darkest">{item.label}</div><div className="mt-1 text-sm text-gray-600">{item.description}</div></button>)}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-subtle lg:col-span-1">
          <div className="mb-5"><div className="text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Selected service</div><h2 className="mt-1 font-display text-2xl text-bhumisetu-darkest">{selectedService.label}</h2></div>
          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-bhumisetu-muted/40 bg-bhumisetu-cream/40 p-8 text-center transition hover:border-bhumisetu-brass hover:bg-yellow-50"><input type="file" accept={selectedService.accept} onChange={(event) => setFile(event.target.files?.[0] || null)} className="hidden" /><div className="text-3xl text-bhumisetu-forest">↑</div><div className="mt-2 font-semibold text-bhumisetu-darkest">{file ? file.name : 'Upload PDF, JPG or PNG'}</div><div className="mt-1 text-xs text-gray-500">Maximum 10 MB · synthetic demo records supported</div></label>
          <button type="button" disabled={!file || processing} onClick={analyze} className="mt-5 w-full rounded-lg bg-bhumisetu-forest px-5 py-3 font-semibold text-white transition hover:bg-bhumisetu-darkest disabled:cursor-not-allowed disabled:opacity-40">{processing ? 'Analyzing document…' : 'Analyze & reconcile'}</button>
          {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}
          {processing && <div className="mt-5"><ProcessingSteps step={step} /></div>}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-subtle lg:col-span-2">
          <div className="mb-6 flex items-center justify-between"><div><div className="text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Administrative review</div><h2 className="font-display text-2xl text-bhumisetu-darkest">Findings &amp; reconciliation</h2></div>{result && <StatusPill tone={result.discrepancies?.length ? 'amber' : 'green'}>{result.discrepancies?.length ? 'REVIEW REQUIRED' : 'RECORDS MATCHED'}</StatusPill>}</div>
          {!result && <div className="flex min-h-64 items-center justify-center rounded-xl bg-bhumisetu-cream/50 p-8 text-center text-gray-500">Upload a supported acquisition document to view extracted fields, source-of-truth validation and recommended action.</div>}
          {result && <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-bhumisetu-cream/60 p-5 md:grid-cols-4"><div><div className="text-xs text-gray-500">Document</div><b>{result.documentType}</b></div><div><div className="text-xs text-gray-500">Project</div><b>{result.matchedRecord?.projectId || result.extractedData?.projectId || 'Not found'}</b></div><div><div className="text-xs text-gray-500">Confidence</div><b>{Math.round((result.extractedData?.confidence || 0) * 100)}%</b></div><div><div className="text-xs text-gray-500">Authority</div><b>System records</b></div></div>
            {service === 'rnr' ? <><div className="grid grid-cols-4 gap-2 text-center">{[['Affected', rnrStats.total], ['Settled', rnrStats.settled], ['In Review', rnrStats.review], ['Pending', rnrStats.pending]].map(([label, value]) => <div key={label} className="rounded-lg border border-gray-200 p-3"><div className="font-display text-2xl">{value}</div><div className="text-xs text-gray-500">{label}</div></div>)}</div><FamilyResults families={result.extractedData.families || []} /></> : <><div className="space-y-2">{(result.validation?.fields || []).map((field) => <div key={field.label} className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3 text-sm"><span>{field.status === 'matched' ? '✓' : '⚠'} {field.label}</span><span className="text-right">{field.status === 'matched' ? <StatusPill>Matched</StatusPill> : <><b>{field.uploaded}</b><span className="mx-2 text-gray-400">vs</span><span>{field.registered}</span></>}</span></div>)}</div>{service === 'compensation' && <div className="grid grid-cols-3 gap-3 rounded-xl bg-bhumisetu-forest p-4 text-center text-white"><div><div className="text-xs text-white/60">Assessed</div><b>₹{result.extractedData.totalAssessed} Cr</b></div><div><div className="text-xs text-white/60">Disbursed</div><b>₹{result.extractedData.amountPaid} Cr</b></div><div><div className="text-xs text-white/60">Pending</div><b>₹{result.extractedData.amountPending} Cr</b></div></div>}{result.discrepancies?.length > 0 && <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5"><div className="font-semibold text-amber-950">Administrative exception detected</div>{result.discrepancies.map((item) => <div key={item} className="mt-2 text-sm text-amber-900">⚠ {item}</div>)}</div>}</>}
            <div className="rounded-xl border border-bhumisetu-brass/40 bg-yellow-50 p-5"><div className="text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Administrative recommendation</div><div className="mt-2 font-semibold text-bhumisetu-darkest">{result.recommendations?.[0]}</div></div>
          </div>}
        </div>
      </section>
    </div>
  )
}
