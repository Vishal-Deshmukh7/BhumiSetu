import { useEffect, useState } from 'react'
import { API_BASE } from '../config'

const areaUnits = [
  { value: 'hectare', label: 'Hectares (ha)' },
  { value: 'acre', label: 'Acres' },
  { value: 'sq m', label: 'Square metres' },
  { value: 'sq ft', label: 'Square feet' },
]

const rateUnits = [
  { value: 'INR/hectare', label: 'INR / hectare' },
  { value: 'INR/acre', label: 'INR / acre' },
  { value: 'INR/sq m', label: 'INR / sq m' },
  { value: 'INR/sq ft', label: 'INR / sq ft' },
]

const emptyForm = {
  areaValue: '',
  areaUnit: 'hectare',
  marketRate: '',
  marketRateUnit: 'INR/hectare',
  locality: 'rural',
  cropsValue: 0,
  structureValue: 0,
  treeValue: 0,
  businessAssetValue: 0,
  livelihoodAmount: 0,
  displacementAmount: 0,
  notificationDate: '',
  awardDate: '',
  displacement: false,
  partialDisplacement: false,
  livelihoodImpact: false,
}

function formatMoney(value) {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value) || 0)}`
}

function formatArea(hectares, unit) {
  const factors = { hectare: 1, acre: 2.47105381, 'sq m': 10000, 'sq ft': 107639.104 }
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format((Number(hectares) || 0) * (factors[unit] || 1))} ${unit === 'hectare' ? 'ha' : unit}`
}

function Field({ label, children, hint }) {
  return <label className="block min-w-0 text-sm font-semibold text-bhumisetu-darkest"><span className="mb-2 block">{label}</span>{children}{hint && <span className="mt-1 block text-xs font-normal text-gray-500">{hint}</span>}</label>
}

function Input({ className = '', ...props }) {
  return <input {...props} className={`min-w-0 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-bhumisetu-darkest outline-none transition focus:border-bhumisetu-brass focus:ring-2 focus:ring-bhumisetu-brass/20 ${className}`} />
}

function Select({ children, ...props }) {
  return <select {...props} className="min-w-0 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-bhumisetu-darkest outline-none focus:border-bhumisetu-brass focus:ring-2 focus:ring-bhumisetu-brass/20">{children}</select>
}

function Panel({ title, eyebrow, children, className = '' }) {
  return <section className={`min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-subtle md:p-6 ${className}`}><div className="mb-5"><div className="text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">{eyebrow}</div><h2 className="mt-1 font-display text-2xl text-bhumisetu-darkest">{title}</h2></div>{children}</section>
}

function formFromParcel(parcel) {
  return {
    ...emptyForm,
    areaValue: parcel.area ?? parcel.landArea?.value ?? parcel.landAreaSqFt ?? '',
    areaUnit: parcel.area ? 'hectare' : parcel.landArea?.unit || (parcel.landAreaSqFt ? 'sq ft' : 'hectare'),
    marketRate: parcel.marketRate ?? '',
    marketRateUnit: parcel.marketRateUnit || 'INR/hectare',
    locality: parcel.locality || (String(parcel.landType || '').toLowerCase().includes('agricultural') ? 'rural' : 'urban'),
    cropsValue: parcel.cropsValue || 0,
    structureValue: parcel.structureValue || 0,
    treeValue: parcel.treeValue || 0,
    businessAssetValue: parcel.businessAssetValue || 0,
    livelihoodAmount: parcel.livelihoodAmount || 0,
    displacementAmount: parcel.displacementAmount || 0,
    notificationDate: parcel.notificationDate || '',
    awardDate: parcel.awardDate || '',
    displacement: Boolean(parcel.displacement),
    partialDisplacement: Boolean(parcel.partialDisplacement),
    livelihoodImpact: Boolean(parcel.livelihoodImpacted),
  }
}

export default function CompensationIntelligencePage() {
  const [projects, setProjects] = useState([])
  const [parcels, setParcels] = useState([])
  const [projectId, setProjectId] = useState('')
  const [parcelId, setParcelId] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [calculation, setCalculation] = useState(null)
  const [insight, setInsight] = useState(null)
  const [assessmentId, setAssessmentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/projects`)
      .then((response) => {
        if (!response.ok) throw new Error('Projects could not be loaded.')
        return response.json()
      })
      .then((data) => {
        const items = data.projects || []
        setProjects(items)
        if (items[0]) setProjectId(items[0].id)
      })
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!projectId) return
    fetch(`${API_BASE}/projects/${projectId}/parcels`)
      .then((response) => {
        if (!response.ok) throw new Error('Parcels could not be loaded.')
        return response.json()
      })
      .then((data) => {
        const items = data.parcels || []
        setParcels(items)
        const firstParcel = items[0]
        setParcelId(firstParcel?.id || '')
        if (firstParcel) {
          setForm(formFromParcel(firstParcel))
          setCalculation(null)
          setInsight(null)
          setAssessmentId('')
        }
      })
      .catch((fetchError) => setError(fetchError.message))
  }, [projectId])

  const selectedParcel = parcels.find((item) => item.id === parcelId)

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const payload = () => ({
    projectId,
    parcelId,
    area: { value: Number(form.areaValue), unit: form.areaUnit },
    marketRate: Number(form.marketRate),
    marketRateUnit: form.marketRateUnit,
    locality: form.locality,
    cropsValue: Number(form.cropsValue) || 0,
    structureValue: Number(form.structureValue) || 0,
    treeValue: Number(form.treeValue) || 0,
    businessAssetValue: Number(form.businessAssetValue) || 0,
    livelihoodAmount: Number(form.livelihoodAmount) || 0,
    displacementAmount: Number(form.displacementAmount) || 0,
    notificationDate: form.notificationDate,
    awardDate: form.awardDate,
    displacement: form.displacement,
    partialDisplacement: form.partialDisplacement,
    livelihoodImpact: form.livelihoodImpact,
  })

  const calculate = async () => {
    setCalculating(true)
    setError('')
    setAssessmentId('')
    try {
      const body = payload()
      const response = await fetch(`${API_BASE}/compensation/calculate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Calculation failed.')
      setCalculation(data.calculation)
      try {
        const analysisResponse = await fetch(`${API_BASE}/compensation/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calculation: data.calculation }) })
        const analysisData = await analysisResponse.json()
        if (analysisResponse.ok) setInsight(analysisData.insight)
        else throw new Error('Analysis unavailable')
      } catch {
        setInsight({ label: 'Fallback decision support', fallback: true, summary: 'AI interpretation was unavailable; review the deterministic result and audit notes.', priorities: [], caveat: 'AI failure did not change the calculation.' })
      }
    } catch (calculationError) {
      setError(calculationError.message)
    } finally {
      setCalculating(false)
    }
  }

  const saveAssessment = async () => {
    if (!calculation) return
    setError('')
    const response = await fetch(`${API_BASE}/compensation/assessments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, parcelId, calculation, insight }) })
    const data = await response.json()
    if (!response.ok) {
      setError(data.message || 'Assessment could not be saved.')
      return
    }
    setAssessmentId(data.assessment.assessmentId)
  }

  return (
    <div className="min-w-0 space-y-7 p-4 md:p-8">
      <header className="max-w-5xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Rule-based decision support</div>
        <h1 className="font-display text-4xl leading-tight text-bhumisetu-darkest md:text-5xl">Compensation Intelligence</h1>
        <p className="max-w-4xl text-sm leading-6 md:text-base">Build a transparent preliminary estimate from parcel facts, valuation inputs, assets and displacement indicators. This is a rule-based estimate for authority review, never a final legal award.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div>}

      <Panel eyebrow="Start with a record" title="Project and parcel context">
        {loading ? <div className="text-sm text-gray-500">Loading project records…</div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Project">
            <Select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name} ({project.id})</option>)}
            </Select>
          </Field>
          <Field label="Parcel">
            <Select value={parcelId} onChange={(event) => {
              const nextParcel = parcels.find((item) => item.id === event.target.value)
              setParcelId(event.target.value)
              if (nextParcel) setForm(formFromParcel(nextParcel))
              setCalculation(null)
              setInsight(null)
              setAssessmentId('')
            }}>
              {parcels.map((parcel) => <option key={parcel.id} value={parcel.id}>{parcel.id} · {parcel.village} · {parcel.landType}</option>)}
            </Select>
          </Field>
          {selectedParcel && <div className="grid grid-cols-2 gap-3 rounded-xl bg-bhumisetu-cream/60 p-4 text-sm md:col-span-2 md:grid-cols-4">
            <div><div className="text-xs text-gray-500">Survey</div><b>{selectedParcel.surveyNumber}</b></div>
            <div><div className="text-xs text-gray-500">Area on record</div><b>{selectedParcel.area} ha</b></div>
            <div><div className="text-xs text-gray-500">Land use</div><b>{selectedParcel.landType}</b></div>
            <div><div className="text-xs text-gray-500">Record status</div><b>{selectedParcel.validation}</b></div>
          </div>}
        </div>}
      </Panel>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-5">
        <Panel eyebrow="Deterministic inputs" title="Valuation and impact controls" className="xl:col-span-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Area" hint="Canonical area is normalized to hectares internally."><div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2"><Input type="number" min="0" step="any" value={form.areaValue} onChange={(event) => setValue('areaValue', event.target.value)} /><Select value={form.areaUnit} onChange={(event) => setValue('areaUnit', event.target.value)}>{areaUnits.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}</Select></div></Field>
            <Field label="Market rate" hint="Rate is normalized to INR per hectare internally."><div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2"><Input type="number" min="0" step="any" value={form.marketRate} onChange={(event) => setValue('marketRate', event.target.value)} /><Select value={form.marketRateUnit} onChange={(event) => setValue('marketRateUnit', event.target.value)}>{rateUnits.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}</Select></div></Field>
            <Field label="Locality"><Select value={form.locality} onChange={(event) => setValue('locality', event.target.value)}><option value="rural">Rural · multiplier 2.0</option><option value="urban">Urban · multiplier 1.0</option></Select></Field>
            <Field label="Notification date"><Input type="date" value={form.notificationDate} onChange={(event) => setValue('notificationDate', event.target.value)} /></Field>
            <Field label="Award date"><Input type="date" value={form.awardDate} onChange={(event) => setValue('awardDate', event.target.value)} /></Field>
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2 md:grid-cols-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 md:col-span-3">Assets and improvements (INR)</div>
              {[['cropsValue', 'Crops'], ['structureValue', 'Structures'], ['treeValue', 'Trees'], ['businessAssetValue', 'Business assets']].map(([key, label]) => <Field key={key} label={label}><Input type="number" min="0" step="any" value={form[key]} onChange={(event) => setValue(key, event.target.value)} /></Field>)}
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2 md:grid-cols-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 md:col-span-2">Displacement and livelihood</div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.displacement} onChange={(event) => setValue('displacement', event.target.checked)} /> Displacement identified</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.partialDisplacement} onChange={(event) => setValue('partialDisplacement', event.target.checked)} /> Partial displacement</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.livelihoodImpact} onChange={(event) => setValue('livelihoodImpact', event.target.checked)} /> Livelihood impact</label>
              <Field label="Livelihood support amount"><Input type="number" min="0" step="any" value={form.livelihoodAmount} onChange={(event) => setValue('livelihoodAmount', event.target.value)} /></Field>
              <Field label="Resettlement amount"><Input type="number" min="0" step="any" value={form.displacementAmount} onChange={(event) => setValue('displacementAmount', event.target.value)} /></Field>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={calculate} disabled={calculating} className="rounded-lg bg-bhumisetu-forest px-5 py-3 font-semibold text-white transition hover:bg-bhumisetu-darkest disabled:cursor-not-allowed disabled:opacity-50">{calculating ? 'Calculating…' : 'Calculate preliminary estimate'}</button>{calculation && <><button type="button" onClick={saveAssessment} className="rounded-lg border border-bhumisetu-forest px-5 py-3 font-semibold text-bhumisetu-forest hover:bg-bhumisetu-cream">Save assessment</button><button type="button" onClick={() => window.print()} className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50">Print / export</button></>}</div>
        </Panel>

        <Panel eyebrow="Record context" title="Parcel facts" className="xl:col-span-2">
          {selectedParcel ? <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-bhumisetu-darkest p-4 text-white"><div className="text-xs uppercase tracking-wider text-bhumisetu-muted">Selected synthetic record</div><div className="mt-1 font-display text-2xl">{selectedParcel.id}</div><div className="mt-1 text-white/70">{selectedParcel.village}, {selectedParcel.district}</div></div>
            <dl className="grid grid-cols-2 gap-3">{[['Scenario', selectedParcel.compensationScenario], ['Owner', selectedParcel.owner?.name], ['Acquisition', selectedParcel.acquisitionStatus], ['Payment', selectedParcel.paymentStatus], ['Possession', selectedParcel.possessionStatus], ['Data class', 'Synthetic demonstration']].map(([label, value]) => <div key={label} className="min-w-0 rounded-lg border border-gray-200 p-3"><dt className="text-xs uppercase tracking-wider text-gray-500">{label}</dt><dd className="mt-1 break-words font-semibold text-bhumisetu-darkest">{value || '—'}</dd></div>)}</dl>
            <div className="rounded-xl border border-bhumisetu-brass/40 bg-yellow-50 p-4 text-xs text-gray-700">Parcel data is synthetic and should be reconciled against authorised land, title, valuation and beneficiary records.</div>
          </div> : <div className="text-sm text-gray-500">Select a parcel to load its facts.</div>}
        </Panel>
      </div>

      {calculation && <div className="space-y-6 print:space-y-4">
        <Panel eyebrow="Calculation output" title="Visual compensation breakdown">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries({ 'Land value': calculation.breakdown.multipliedMarketValue, Solatium: calculation.breakdown.solatium, 'Additional amount': calculation.breakdown.additionalAmount, 'Assets and improvements': calculation.breakdown.assets, 'Livelihood support': calculation.breakdown.livelihoodSupport, 'Resettlement support': calculation.breakdown.displacementSupport }).map(([label, value]) => <div key={label} className="min-w-0 rounded-xl border border-gray-200 p-4"><div className="text-xs uppercase tracking-wider text-gray-500">{label}</div><div className="mt-2 break-words font-display text-2xl text-bhumisetu-darkest">{formatMoney(value)}</div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-bhumisetu-brass" style={{ width: `${Math.min(100, (Number(value) / Math.max(Number(calculation.breakdown.total), 1)) * 100)}%` }} /></div></div>)}
          </div>
          <div className="mt-5 flex flex-col gap-2 rounded-xl bg-bhumisetu-forest p-5 text-white sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs uppercase tracking-wider text-white/60">Preliminary total</div><div className="font-display text-4xl">{formatMoney(calculation.breakdown.total)}</div></div><div className="text-sm text-white/75">Area normalized: {formatArea(calculation.normalized.areaHectares, form.areaUnit)} · Rate: {formatMoney(calculation.normalized.marketRatePerHectare)} / ha</div></div>
        </Panel>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel eyebrow="Explainability" title="Applied rules and audit notes">
            <div className="space-y-3">{calculation.appliedRules.map((rule) => <div key={rule.key} className="rounded-lg border border-gray-200 p-3 text-sm"><div className="flex flex-wrap justify-between gap-2 font-semibold"><span>{rule.label}</span><span>{rule.key === 'multiplier' ? `${rule.value}×` : `${Number(rule.value) * 100}%`}</span></div><div className="mt-1 text-xs text-gray-600">{rule.reason}</div><div className="mt-1 text-[0.68rem] uppercase tracking-wider text-gray-400">{rule.source} · {rule.version}</div></div>)}</div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-600">{calculation.auditNotes.map((note) => <li key={note}>{note}</li>)}</ul>
          </Panel>
          <Panel eyebrow="Entitlement review" title="Reasons and flags">
            <div className="space-y-3">{calculation.entitlements.map((entitlement) => <div key={entitlement.key} className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3"><div className="min-w-0"><div className="font-semibold text-bhumisetu-darkest">{entitlement.label}</div><div className="mt-1 text-xs text-gray-600">{entitlement.reason}</div></div><div className="shrink-0 font-semibold text-bhumisetu-darkest">{formatMoney(entitlement.amount)}</div></div>)}</div>
            <div className="mt-4 space-y-2">{calculation.flags.map((flag) => <div key={flag.key} className="rounded-lg bg-bhumisetu-cream/70 p-3 text-sm"><b>{flag.label}:</b> {flag.message}</div>)}</div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel eyebrow="Resettlement planning" title="Infrastructure considerations">
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">{(selectedParcel?.resettlementInfrastructure?.length ? selectedParcel.resettlementInfrastructure : calculation.resettlementConsiderations).map((item) => <li key={item}>{item}</li>)}</ul>
            <p className="mt-4 text-xs text-gray-500">These are planning prompts, not an entitlement determination.</p>
          </Panel>
          <Panel eyebrow="AI decision support" title={insight?.label || 'Interpretation pending'}>
            {insight ? <div className="space-y-3 text-sm"><div className="rounded-xl bg-bhumisetu-cream/60 p-4 text-gray-700">{insight.summary}</div><ul className="list-disc space-y-2 pl-5 text-gray-700">{insight.priorities?.map((priority) => <li key={priority}>{priority}</li>)}</ul><div className="text-xs text-gray-500">{insight.caveat}{insight.fallback ? ' Gemini fallback is labelled and did not alter the calculation.' : ''}</div></div> : <div className="text-sm text-gray-500">Run a calculation to generate advisory interpretation.</div>}
          </Panel>
        </div>
        <div className="rounded-xl border border-bhumisetu-brass/50 bg-yellow-50 p-4 text-sm text-bhumisetu-darkest"><b>Authority notice:</b> This assessment is preliminary, rule-based and informational. It is not a final legal award or tax advice; competent authority review is mandatory.{assessmentId && <span className="ml-2 font-semibold">Saved as {assessmentId}.</span>}</div>
      </div>}
    </div>
  )
}
