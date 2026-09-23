import { getRiskScoreBadge } from '../utils/risk'

const severityStyles = {
  high: { dot: 'bg-red-500', card: 'border-red-200 bg-red-50/60', label: 'text-red-800' },
  medium: { dot: 'bg-amber-500', card: 'border-amber-200 bg-amber-50/60', label: 'text-amber-800' },
  low: { dot: 'bg-blue-500', card: 'border-blue-200 bg-blue-50/60', label: 'text-blue-800' },
  none: { dot: 'bg-green-500', card: 'border-green-200 bg-green-50/60', label: 'text-green-800' },
}

const statusBadge = (status) => {
  const map = {
    'Paid': 'bg-green-100 text-green-800',
    'Verified': 'bg-green-100 text-green-800',
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-amber-100 text-amber-800',
    'Pending': 'bg-gray-200 text-gray-700',
    'Mismatch Detected': 'bg-red-100 text-red-800',
    'Not Paid': 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-200 text-gray-700'
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bhumisetu-forest/10 text-bhumisetu-forest">
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <div className="font-display text-lg text-bhumisetu-darkest leading-tight">{title}</div>
        {subtitle && <div className="text-xs font-body text-gray-500 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  )
}

function ListBlock({ title, items, variant = 'default' }) {
  if (!items?.length) return null
  const colorMap = {
    default: 'text-bhumisetu-darkest bg-gray-50 border-gray-100',
    risk: 'text-red-900 bg-red-50/60 border-red-100',
    action: 'text-bhumisetu-forest bg-emerald-50/60 border-emerald-100',
  }
  return (
    <div className="mt-4">
      <div className="text-xs font-body font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm font-body px-3 py-2 rounded-lg border ${colorMap[variant]}`}>
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-bhumisetu-brass" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProvenanceBar({ provenance }) {
  if (!provenance) return null
  return (
    <div className="mt-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      <span className="text-xs font-body font-semibold text-gray-500 uppercase tracking-wider">{provenance.mode}</span>
      <span className="text-xs font-body text-gray-500">|</span>
      <span className="text-xs font-body text-gray-600">{provenance.note}</span>
    </div>
  )
}

function ConflictCard({ conflict }) {
  const config = severityStyles[conflict.severity] || severityStyles.none
  return (
    <div className={`rounded-xl border p-4 ${config.card}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
          <span className="text-sm font-body font-semibold text-bhumisetu-darkest">{conflict.parcelId}</span>
        </div>
        <span className={`text-xs font-bold font-body uppercase px-2.5 py-1 rounded-full ${config.label} bg-white/80`}>
          {conflict.severity}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(conflict.fields || {}).map(([key, value]) => (
          <span key={key} className={`inline-flex items-center gap-1 text-xs font-body px-2 py-1 rounded-md border ${statusBadge(value)}`}>
            <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
            <span className="font-semibold">{value}</span>
          </span>
        ))}
      </div>
      {conflict.reasons?.length > 0 && (
        <ul className="space-y-1">
          {conflict.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-xs font-body text-gray-700">
              <span className="text-red-400 mt-0.5">!</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ParcelRow({ parcel, showCriticality }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-body hover:bg-gray-50/50 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-bhumisetu-darkest">{parcel.parcelId}</div>
        <div className="text-xs text-gray-500">{parcel.village} &middot; {parcel.district}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-semibold text-bhumisetu-darkest">{parcel.area} ha</div>
        <div className="text-xs text-gray-500">{parcel.landType}</div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${statusBadge(parcel.acquisitionStatus)}`}>
          {parcel.acquisitionStatus}
        </span>
      </div>
      {showCriticality && parcel.criticalityScore != null && (
        <div className="text-right shrink-0">
          <div className={`text-lg font-display font-bold ${parcel.criticalityScore >= 80 ? 'text-red-600' : parcel.criticalityScore >= 70 ? 'text-amber-600' : 'text-gray-600'}`}>
            {parcel.criticalityScore}
          </div>
          <div className="text-xs text-gray-400">score</div>
        </div>
      )}
    </div>
  )
}

function ModelTag({ model }) {
  if (!model) return null
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-body font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
      <span className="h-1.5 w-1.5 rounded-full bg-bhumisetu-muted" />
      {model}
    </span>
  )
}

/* ---- Main response renderers ---- */

function renderCaseSummary(data) {
  const ai = data.ai || {}
  const project = data.project
  const parcels = data.parcels || []

  return (
    <div className="space-y-6">
      {project && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="!" title={project.name} subtitle={`${project.projectId} \u00B7 ${project.district}`} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs font-body text-gray-500 mb-1">Status</div>
              <div className="text-sm font-body font-semibold text-bhumisetu-darkest">{project.status}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs font-body text-gray-500 mb-1">Progress</div>
              <div className="text-sm font-body font-semibold text-bhumisetu-darkest">{project.progress}%</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs font-body text-gray-500 mb-1">Compensation</div>
              <div className="text-sm font-body font-semibold text-bhumisetu-darkest">{project.compensationProgress}%</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs font-body text-gray-500 mb-1">Possession</div>
              <div className="text-sm font-body font-semibold text-bhumisetu-darkest">{project.possession}%</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-bhumisetu-forest to-bhumisetu-muted rounded-full" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <SectionHeader icon="*" title="AI Summary" subtitle="Generated by OpenRouter model" />
        <ModelTag model={ai.model} />
        <p className="mt-3 text-sm font-body text-gray-700 leading-relaxed whitespace-pre-wrap">{ai.summary}</p>
        <ListBlock title="Key Risks" items={ai.keyRisks} variant="risk" />
        <ListBlock title="Next Actions" items={ai.nextActions} variant="action" />
      </div>

      {parcels.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="#" title="Linked Parcels" subtitle={`${parcels.length} parcels in scope`} />
          <div className="space-y-2 mt-3">
            {parcels.map((parcel) => (
              <ParcelRow key={parcel.parcelId} parcel={parcel} />
            ))}
          </div>
        </div>
      )}

      <ProvenanceBar provenance={data.provenance} />
    </div>
  )
}

function renderConflictExplanation(data) {
  const ai = data.ai || {}
  const project = data.project
  const conflicts = data.conflicts || []

  return (
    <div className="space-y-6">
      {project && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="!" title={project.name} subtitle={`${project.projectId} \u00B7 ${project.district}`} />
          <div className="flex gap-3 mt-3">
            <span className="text-xs font-body font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">Risk Score: {project.riskScore}</span>
            <span className="text-xs font-body font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">{conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected</span>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <SectionHeader icon="!" title="Conflict Analysis" subtitle="AI-generated explanation" />
        <ModelTag model={ai.model} />
        <p className="mt-3 text-sm font-body text-gray-700 leading-relaxed whitespace-pre-wrap">{ai.explanation}</p>
        <ListBlock title="Key Observations" items={ai.keyPoints} />
        <ListBlock title="Recommended Actions" items={ai.recommendedActions} variant="action" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <SectionHeader icon="!" title="Parcel Conflicts" subtitle={`${conflicts.length} parcel${conflicts.length !== 1 ? 's' : ''} with issues`} />
        <div className="space-y-3 mt-3">
          {conflicts.map((conflict) => (
            <ConflictCard key={conflict.parcelId} conflict={conflict} />
          ))}
        </div>
      </div>

      <ProvenanceBar provenance={data.provenance} />
    </div>
  )
}

function renderCriticalParcels(data) {
  const ai = data.ai || {}
  const project = data.project
  const critical = data.criticalParcels || []
  const alternatives = data.alternatives || []
  const riskBadge = project ? getRiskScoreBadge(project.riskScore) : null

  const hasAiContent = ai.explanation || ai.keyPoints?.length || ai.recommendedActions?.length

  return (
    <div className="space-y-6">
      {project && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="!" title={project.name} subtitle={`${project.projectId} \u00B7 ${project.district}`} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs font-body text-gray-500 mb-1">Status</div>
              <div className="text-sm font-body font-semibold text-bhumisetu-darkest">{project.status}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs font-body text-gray-500 mb-1">Progress</div>
              <div className="text-sm font-body font-semibold text-bhumisetu-darkest">{project.progress}%</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs font-body text-gray-500 mb-1">Risk Score</div>
              <div className={`text-sm font-body font-bold ${riskBadge?.textClass || 'text-gray-700'}`}>{project.riskScore}/100</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs font-body text-gray-500 mb-1">Land Pending</div>
              <div className="text-sm font-body font-semibold text-bhumisetu-darkest">{project.landPending} ha</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            {riskBadge && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${riskBadge.badgeClass}`}>{riskBadge.shortLabel}</span>
            )}
            <span className="text-xs font-body font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800">
              {critical.length} critical parcel{critical.length !== 1 ? 's' : ''}
            </span>
            {alternatives.length > 0 && (
              <span className="text-xs font-body font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                {alternatives.length} alternative{alternatives.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {hasAiContent && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="!" title="Criticality Analysis" subtitle="AI-generated explanation" />
          <ModelTag model={ai.model} />
          {ai.explanation && <p className="mt-3 text-sm font-body text-gray-700 leading-relaxed whitespace-pre-wrap">{ai.explanation}</p>}
          <ListBlock title="Key Observations" items={ai.keyPoints} />
          <ListBlock title="Recommended Actions" items={ai.recommendedActions} variant="action" />
        </div>
      )}

      {critical.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/30 p-5">
          <SectionHeader icon="!" title="Critical Parcels" subtitle="Require immediate attention" />
          <div className="space-y-2 mt-3">
            {critical.map((parcel) => (
              <ParcelRow key={parcel.parcelId} parcel={parcel} showCriticality />
            ))}
          </div>
        </div>
      )}

      {alternatives.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="#" title="Alternative Parcels" subtitle="Lower-risk options identified" />
          <div className="space-y-2 mt-3">
            {alternatives.map((alt) => (
              <div key={alt.parcelId} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-body">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-bhumisetu-darkest">{alt.parcelId}</div>
                  <div className="text-xs text-gray-500">{alt.projectId}</div>
                </div>
                <div className="text-xs font-body text-gray-600 max-w-[200px] text-right">{alt.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProvenanceBar provenance={data.provenance} />
    </div>
  )
}

function renderAssistantQuery(data) {
  const ai = data.ai || {}
  const result = data.result || {}
  const conflicts = result.conflicts || []
  const criticalParcels = result.criticalParcels || []
  const projects = result.projects || []
  const parcels = result.parcels || []

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <SectionHeader icon="?" title="Assistant Response" subtitle={`Filter: ${data.filter || 'N/A'}`} />
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-body text-gray-400 italic">Query:</span>
          <span className="text-sm font-body font-semibold text-bhumisetu-darkest">"{data.question}"</span>
        </div>
        <ModelTag model={ai.model} />
        <p className="mt-4 text-sm font-body text-gray-700 leading-relaxed whitespace-pre-wrap">{ai.answer}</p>
        <ListBlock title="Suggested Actions" items={ai.actions} variant="action" />
      </div>

      {conflicts.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="!" title="Conflicts Found" subtitle={`${conflicts.length} result${conflicts.length !== 1 ? 's' : ''}`} />
          <div className="space-y-3 mt-3">
            {conflicts.map((conflict) => (
              <ConflictCard key={conflict.parcelId} conflict={conflict} />
            ))}
          </div>
        </div>
      )}

      {criticalParcels.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="!" title="Critical Parcels" subtitle={`${criticalParcels.length} parcel${criticalParcels.length !== 1 ? 's' : ''}`} />
          <div className="space-y-2 mt-3">
            {criticalParcels.map((parcel) => (
              <ParcelRow key={parcel.parcelId} parcel={parcel} showCriticality />
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="#" title="Projects" subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''}`} />
          <div className="space-y-2 mt-3">
            {projects.map((proj) => {
              const badge = getRiskScoreBadge(proj.riskScore)
              return (
                <div key={proj.projectId} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-body">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-bhumisetu-darkest">{proj.name}</div>
                    <div className="text-xs text-gray-500">{proj.projectId} &middot; {proj.district}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Progress</div>
                      <div className="font-semibold text-bhumisetu-darkest">{proj.progress}%</div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.badgeClass}`}>{badge.shortLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {parcels.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader icon="#" title="Affected Parcels" subtitle={`${parcels.length} parcel${parcels.length !== 1 ? 's' : ''}`} />
          <div className="space-y-2 mt-3">
            {parcels.map((parcel) => (
              <ParcelRow key={parcel.parcelId} parcel={parcel} />
            ))}
          </div>
        </div>
      )}

      <ProvenanceBar provenance={data.provenance} />
    </div>
  )
}

/* ---- Detect response type and dispatch ---- */

function detectType(data) {
  if (!data || typeof data !== 'object') return null
  if (data.ai?.summary && data.ai?.keyRisks) return 'case-summary'
  if ((data.ai?.explanation || data.conflicts) && data.conflicts) return 'conflict-explanation'
  if ((data.ai?.explanation || data.criticalParcels) && data.criticalParcels) return 'critical-parcels'
  if (data.ai?.answer || data.question) return 'assistant-query'
  return null
}

export default function AiResponsePanel({ data }) {
  const type = detectType(data)

  if (!type) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Structured response</div>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  switch (type) {
    case 'case-summary':
      return renderCaseSummary(data)
    case 'conflict-explanation':
      return renderConflictExplanation(data)
    case 'critical-parcels':
      return renderCriticalParcels(data)
    case 'assistant-query':
      return renderAssistantQuery(data)
    default:
      return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )
  }
}
