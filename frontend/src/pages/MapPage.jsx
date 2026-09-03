import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { API_BASE } from '../config'

const TILE_LAYERS = {
  standard: {
    label: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap',
  },
  topographic: {
    label: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap',
  },
}

function getPositions(parcel) {
  if (parcel?.leafletCoordinates?.length) return parcel.leafletCoordinates
  const ring = parcel?.geometry?.coordinates?.[0] || parcel?.parcelShape?.coordinates?.[0]
  if (!Array.isArray(ring)) return []
  return ring
    .filter((point) => Array.isArray(point) && point.length >= 2 && Number.isFinite(point[0]) && Number.isFinite(point[1]))
    .map(([longitude, latitude]) => [latitude, longitude])
}

function FitMapToParcels({ parcels }) {
  const map = useMap()

  useEffect(() => {
    const points = parcels.flatMap(getPositions)
    if (points.length > 0) map.fitBounds(points, { padding: [36, 36], maxZoom: 13 })
  }, [map, parcels])

  return null
}

function FlyToParcel({ parcel }) {
  const map = useMap()

  useEffect(() => {
    const positions = getPositions(parcel)
    if (positions.length > 0) map.flyToBounds(positions, { padding: [60, 60], maxZoom: 16, duration: 0.8 })
  }, [map, parcel])

  return null
}

function getParcelColor(validation) {
  if (validation === 'Mismatch Detected' || validation === 'Data Conflict') return '#b84a43'
  if (validation === 'Anomaly') return '#c58a35'
  return '#3e8064'
}

function statusTone(status = '') {
  const value = String(status || '').toLowerCase()
  if (value.includes('paid') || value.includes('progress')) return 'bg-green-100 text-green-900'
  if (value.includes('await') || value.includes('pending') || value.includes('notified')) return 'bg-amber-100 text-amber-900'
  return 'bg-slate-100 text-slate-800'
}

function GeometryPreview({ parcel }) {
  const points = getPositions(parcel)
  if (!points.length) return null
  const lats = points.map(([lat]) => lat)
  const lngs = points.map(([, lng]) => lng)
  const minLat = Math.min(...lats)
  const minLng = Math.min(...lngs)
  const latSpan = Math.max(Math.max(...lats) - minLat, 0.0001)
  const lngSpan = Math.max(Math.max(...lngs) - minLng, 0.0001)
  const path = points.map(([lat, lng]) => `${12 + ((lng - minLng) / lngSpan) * 176},${12 + (1 - (lat - minLat) / latSpan) * 96}`).join(' ')

  return (
    <svg viewBox="0 0 200 120" role="img" aria-label="Synthetic parcel boundary preview" className="h-32 w-full rounded-lg border border-bhumisetu-muted/20 bg-bhumisetu-cream/60">
      <path d="M 12 20 H 188 M 12 60 H 188 M 12 100 H 188 M 40 8 V 112 M 100 8 V 112 M 160 8 V 112" stroke="#d8d4c8" strokeWidth="1" />
      <polygon points={path} fill="#c7a75b" fillOpacity="0.35" stroke="#12372a" strokeWidth="2.5" />
      <circle cx="100" cy="60" r="3" fill="#b84a43" />
    </svg>
  )
}

function Metric({ label, value }) {
  return <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3"><div className="text-[0.68rem] font-semibold uppercase tracking-wider text-gray-500">{label}</div><div className="mt-1 break-words font-display text-xl text-bhumisetu-darkest">{value}</div></div>
}

export default function MapPage() {
  const [parcels, setParcels] = useState([])
  const [selectedParcel, setSelectedParcel] = useState(null)
  const [selectedContext, setSelectedContext] = useState(null)
  const [layer, setLayer] = useState('standard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch(`${API_BASE}/map`)
      .then((res) => {
        if (!res.ok) throw new Error(`Map request failed with ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const validParcels = Array.isArray(data.parcels)
          ? data.parcels.filter((parcel) => getPositions(parcel).length >= 4)
          : []
        if (active) setParcels(validParcels)
      })
      .catch((fetchError) => { if (active) setError(fetchError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selectedParcel?.id) {
      return undefined
    }
    let active = true
    fetch(`${API_BASE}/parcels/${selectedParcel.id}/context`)
      .then((res) => res.json())
      .then((data) => { if (active) setSelectedContext(data) })
      .catch(() => { if (active) setSelectedContext(null) })
    return () => { active = false }
  }, [selectedParcel])

  const mapCenter = useMemo(() => {
    const points = parcels.flatMap(getPositions)
    if (!points.length) return [20.55, 77.2]
    return points.reduce((center, point) => [center[0] + point[0] / points.length, center[1] + point[1] / points.length], [0, 0])
  }, [parcels])
  const activeLayer = TILE_LAYERS[layer]
  const hasCurrentContext = Boolean(selectedParcel?.id && selectedContext?.parcel?.id === selectedParcel.id)
  const contextParcel = hasCurrentContext ? selectedContext.parcel : selectedParcel
  const contextProject = hasCurrentContext ? (selectedContext.project || selectedContext.context?.parentProject) : null

  return (
    <div className="space-y-6 p-4 md:p-8">
      <header className="space-y-2">
        <div className="text-xs font-body font-semibold uppercase tracking-wider text-bhumisetu-muted">GIS Parcel Explorer</div>
        <h1 className="font-display text-4xl leading-tight text-bhumisetu-darkest md:text-5xl">Map-based Parcel Monitoring</h1>
        <p className="max-w-3xl text-sm">Inspect synthetic parcel boundaries in the context of public infrastructure projects and their acquisition workflows.</p>
      </header>

      <section className="map-workspace">
        <div className="map-viewport relative overflow-hidden rounded-2xl border border-bhumisetu-forest/30 bg-slate-200 shadow-subtle">
          <MapContainer center={mapCenter} zoom={5} scrollWheelZoom className="h-full min-h-[620px] w-full" style={{ height: '100%', minHeight: '620px' }}>
            <TileLayer key={layer} url={activeLayer.url} attribution={activeLayer.attribution} />
            <FitMapToParcels parcels={parcels} />
            {selectedParcel && <FlyToParcel parcel={selectedParcel} />}
            {parcels.map((parcel) => {
              const isSelected = selectedParcel?.id === parcel.id
              const color = getParcelColor(parcel.validation)
              return (
                <Polygon
                  key={parcel.id}
                  positions={getPositions(parcel)}
                  pathOptions={{ color: isSelected ? '#c7a75b' : color, fillColor: isSelected ? '#c7a75b' : color, fillOpacity: isSelected ? 0.62 : selectedParcel ? 0.08 : 0.3, opacity: isSelected || !selectedParcel ? 1 : 0.35, weight: isSelected ? 4 : 1.5 }}
                  eventHandlers={{ click: () => setSelectedParcel(parcel) }}
                >
                  <Tooltip sticky><strong>{parcel.id}</strong><br />{parcel.village}, {parcel.district}<br />{parcel.area} ha</Tooltip>
                </Polygon>
              )
            })}
          </MapContainer>
          <div className="absolute left-4 top-4 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-xs shadow-md">
            <div className="font-semibold text-bhumisetu-darkest">National project view</div>
            <div className="text-gray-500">Synthetic parcel boundaries - {parcels.length} records</div>
          </div>
          <div className="absolute right-4 top-4 z-[1000] flex max-w-[calc(100%-2rem)] overflow-x-auto rounded-lg bg-white/95 shadow-md">
            {Object.entries(TILE_LAYERS).map(([key, value]) => <button key={key} type="button" onClick={() => setLayer(key)} className={`whitespace-nowrap px-3 py-2 text-xs font-semibold transition-colors ${layer === key ? 'bg-bhumisetu-forest text-white' : 'text-bhumisetu-forest hover:bg-bhumisetu-cream'}`}>{value.label}</button>)}
          </div>
          {loading && <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/60 text-sm">Loading parcel boundaries...</div>}
          {error && <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 shadow-md">{error}</div>}
        </div>

        <aside className={`map-inspector rounded-2xl border border-gray-200 bg-white shadow-subtle ${selectedParcel ? 'map-inspector-open' : ''}`}>
          {!contextParcel ? (
            <div className="flex h-full min-h-0 items-center justify-center p-6 text-center text-gray-600 md:min-h-80 md:p-8">
              <div><div className="mb-2 text-sm font-semibold uppercase tracking-wider text-bhumisetu-brass">Parcel inspector</div><div className="font-body">Select a parcel boundary to open its inspector.</div><div className="mt-2 text-xs text-gray-500">The map remains interactive while the inspector scrolls independently.</div></div>
            </div>
          ) : (
            <div className="space-y-5 p-5 md:p-6">
              <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-4">
                <div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Land parcel inspector</div><h2 className="mt-1 font-display text-3xl text-bhumisetu-darkest">{contextParcel.id}</h2><div className="mt-1 break-words text-sm text-gray-600">{contextParcel.village}, {contextParcel.district} - {contextParcel.surveyNumber}</div></div>
                <button type="button" aria-label="Clear selected parcel" onClick={() => setSelectedParcel(null)} className="shrink-0 rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100">x</button>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <Metric label="Area" value={`${contextParcel.area} ha`} />
                <Metric label="Land type" value={String(contextParcel.landType || 'Unclassified').replace('Private ', '')} />
                <Metric label="Acquisition" value={contextParcel.acquisitionStatus} />
                <Metric label="Possession" value={contextParcel.possessionStatus} />
              </div>
              <GeometryPreview parcel={contextParcel} />
              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0"><div className="text-xs uppercase tracking-wider text-gray-500">Compensation</div><div className="mt-1 break-words font-semibold text-bhumisetu-darkest">Rs {contextParcel.compensation} Cr</div></div>
                <div><div className="text-xs uppercase tracking-wider text-gray-500">Payment status</div><span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-bold ${statusTone(contextParcel.paymentStatus)}`}>{contextParcel.paymentStatus}</span></div>
              </div>
              <section><div className="mb-2 text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Synthetic ownership & title</div><div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm"><div className="break-words font-semibold">{contextParcel.owner?.name}</div><div className="break-words text-gray-600">{contextParcel.owner?.type}</div>{contextParcel.titleRecords?.map((record) => <div key={record.type} className="mt-2 flex min-w-0 justify-between gap-3 border-t border-gray-200 pt-2 text-xs"><span className="break-words">{record.type}</span><span className="break-words text-right text-gray-500">{record.status}</span></div>)}</div></section>
              <section><div className="mb-2 text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Acquisition timeline</div><ol className="space-y-3 border-l-2 border-bhumisetu-brass/50 pl-4">{(selectedContext?.context?.timeline || contextParcel.timeline || []).map((item) => <li key={item.label} className="relative text-sm"><span className="absolute -left-[1.38rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-bhumisetu-brass" /><div className="break-words font-semibold text-bhumisetu-darkest">{item.label}</div><div className="break-words text-xs text-gray-500">{item.date} - {item.status}</div></li>)}</ol></section>
              <section className="rounded-lg border border-bhumisetu-brass/40 bg-yellow-50 p-4"><div className="text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">Project context</div><div className="mt-1 break-words font-semibold text-bhumisetu-darkest">{contextProject?.name || contextParcel.projectId}</div><div className="mt-1 break-words text-xs text-gray-600">{contextProject?.implementingAgency} - {contextProject?.status}</div><div className="mt-2 break-words text-sm text-gray-700">{contextParcel.impact?.landUseImpact}</div><div className="mt-3 break-words text-xs text-gray-600"><b>Operational dependency:</b> {selectedContext?.context?.operationalDependency || contextParcel.operationalDependency}</div>{contextProject?.sourceMetadata?.sources?.[0]?.url && <a className="mt-3 inline-block break-words text-xs font-semibold text-bhumisetu-forest underline" href={contextProject.sourceMetadata.sources[0].url} target="_blank" rel="noreferrer">View public source -&gt;</a>}</section>
              {contextParcel.aiInsight && <section className="rounded-lg border border-bhumisetu-forest/20 bg-bhumisetu-cream/60 p-4 text-sm"><div className="text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">{contextParcel.aiInsight.label}</div><div className="mt-1 text-gray-700">{contextParcel.aiInsight.text}</div></section>}
              <div className="text-[0.68rem] uppercase tracking-wider text-gray-500">Parcel data classification: synthetic demonstration record</div>
            </div>
          )}
        </aside>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-subtle md:p-8">
        <div className="mb-5 flex items-end justify-between gap-3"><div><h2 className="font-display text-2xl text-bhumisetu-darkest">All parcels</h2><p className="mt-1 text-xs text-gray-500">Synthetic parcel records are linked to public project metadata.</p></div><div className="text-xs text-gray-500">{parcels.length} records</div></div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {parcels.map((parcel) => <button key={parcel.id} type="button" onClick={() => setSelectedParcel(parcel)} className={`rounded-xl border-2 p-4 text-left transition-all ${selectedParcel?.id === parcel.id ? 'border-bhumisetu-brass bg-yellow-50' : 'border-gray-200 bg-white hover:border-bhumisetu-brass'}`}><div className="font-display text-lg text-bhumisetu-darkest">{parcel.id}</div><div className="mt-1 text-xs text-gray-600">{parcel.village}, {parcel.district}</div><div className="mt-3 flex items-center justify-between gap-2"><span className="text-sm font-semibold text-gray-700">{parcel.area} ha</span><span className={`rounded-full px-2 py-1 text-[0.68rem] font-bold ${statusTone(parcel.acquisitionStatus)}`}>{parcel.acquisitionStatus}</span></div></button>)}
        </div>
      </section>
    </div>
  )
}
