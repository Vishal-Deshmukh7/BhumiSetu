import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { API_BASE } from '../config'

const TILE_LAYERS = {
  street: {
    label: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
}

function FitMapToParcels({ parcels }) {
  const map = useMap()

  useEffect(() => {
    const points = parcels.flatMap((parcel) => parcel.geometry || [])
    if (points.length > 0) {
      map.fitBounds(points, { padding: [36, 36], maxZoom: 13 })
    }
  }, [map, parcels])

  return null
}

function getParcelColor(validation) {
  if (validation === 'Mismatch Detected' || validation === 'Data Conflict') return '#dc2626'
  if (validation === 'Anomaly') return '#d97706'
  return '#16805c'
}

function getValidationColor(validation) {
  if (validation === 'Mismatch Detected' || validation === 'Data Conflict') return 'bg-red-100 text-red-900'
  if (validation === 'Anomaly') return 'bg-orange-100 text-orange-900'
  return 'bg-green-100 text-green-900'
}

export default function MapPage() {
  const [parcels, setParcels] = useState([])
  const [selectedParcel, setSelectedParcel] = useState(null)
  const [layer, setLayer] = useState('terrain')
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
        if (active) setParcels(data.parcels || [])
      })
      .catch((fetchError) => {
        if (active) setError(fetchError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const mapCenter = useMemo(() => {
    const points = parcels.flatMap((parcel) => parcel.geometry || [])
    if (points.length === 0) return [20.55, 77.2]
    return points.reduce(
      (center, point) => [center[0] + point[0] / points.length, center[1] + point[1] / points.length],
      [0, 0],
    )
  }, [parcels])

  const activeLayer = TILE_LAYERS[layer]

  return (
    <div className="p-8 space-y-8">
      <header className="space-y-2">
        <div className="text-xs font-body font-semibold text-bhumisetu-muted uppercase tracking-wider mb-2">GIS Parcel Explorer</div>
        <h1 className="font-display text-5xl leading-tight text-bhumisetu-darkest">Map-based Parcel Monitoring</h1>
        <p className="max-w-3xl text-sm">Inspect surveyed boundaries against live terrain and satellite context across the active acquisition corridors.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[34rem]">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-bhumisetu-forest/30 bg-slate-200 shadow-subtle">
          <MapContainer center={mapCenter} zoom={7} scrollWheelZoom className="h-full min-h-[34rem] w-full">
            <TileLayer key={layer} url={activeLayer.url} attribution={activeLayer.attribution} />
            <FitMapToParcels parcels={parcels} />
            {parcels.map((parcel) => {
              const color = getParcelColor(parcel.validation)
              const isSelected = selectedParcel?.id === parcel.id

              return (
                <Polygon
                  key={parcel.id}
                  positions={parcel.geometry || []}
                  pathOptions={{
                    color: isSelected ? '#b8953e' : color,
                    fillColor: isSelected ? '#d6b55b' : color,
                    fillOpacity: isSelected ? 0.5 : 0.3,
                    weight: isSelected ? 4 : 2,
                  }}
                  eventHandlers={{ click: () => setSelectedParcel(parcel) }}
                >
                  <Tooltip sticky>
                    <strong>{parcel.id}</strong>
                    <br />
                    {parcel.village}, {parcel.district}
                    <br />
                    {parcel.area} ha
                  </Tooltip>
                </Polygon>
              )
            })}
          </MapContainer>

          <div className="absolute left-4 top-4 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-xs shadow-md">
            <div className="font-semibold text-bhumisetu-darkest">Maharashtra Region</div>
            <div className="text-gray-500">Parcel boundaries • {parcels.length} records</div>
          </div>

          <div className="absolute right-4 top-4 z-[1000] flex overflow-hidden rounded-lg bg-white/95 shadow-md">
            {Object.entries(TILE_LAYERS).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => setLayer(key)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  layer === key ? 'bg-bhumisetu-forest text-white' : 'text-bhumisetu-forest hover:bg-bhumisetu-cream'
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>

          {loading && <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/60 text-sm">Loading parcel boundaries...</div>}
          {error && <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 shadow-md">{error}</div>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-subtle p-6 overflow-y-auto">
          {selectedParcel ? (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Selected Parcel</div>
                <div className="font-display text-2xl text-bhumisetu-darkest">{selectedParcel.id}</div>
              </div>
              <div>
                <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Village</div>
                <div className="text-gray-700 font-body">{selectedParcel.village}</div>
              </div>
              <div>
                <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Survey Number</div>
                <div className="text-gray-700 font-body">{selectedParcel.surveyNumber}</div>
              </div>
              <div>
                <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Area</div>
                <div className="font-display text-2xl text-bhumisetu-darkest">{selectedParcel.area} <span className="text-base text-gray-500">ha</span></div>
              </div>
              <div>
                <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Validation Status</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getValidationColor(selectedParcel.validation)}`}>
                  {selectedParcel.validation}
                </span>
              </div>
              <div>
                <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Payment Status</div>
                <div className="text-gray-700 font-body">{selectedParcel.paymentStatus}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-600">
              <div className="font-body">Click a parcel boundary on the map to view details</div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
        <h2 className="font-display text-2xl text-bhumisetu-darkest mb-6">All Parcels</h2>
        {parcels.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-600">No parcels found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {parcels.map((parcel) => (
              <button
                key={parcel.id}
                type="button"
                onClick={() => setSelectedParcel(parcel)}
                className={`text-left p-4 rounded-xl border-2 transition-all font-body ${
                  selectedParcel?.id === parcel.id ? 'border-bhumisetu-brass bg-yellow-50' : 'border-gray-200 hover:border-bhumisetu-brass bg-white'
                }`}
              >
                <div className="font-display text-lg text-bhumisetu-darkest mb-2">{parcel.id}</div>
                <div className="text-xs text-gray-600 mb-3">
                  <div>{parcel.village}, {parcel.district}</div>
                  <div>{parcel.surveyNumber}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">{parcel.area} ha</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${getValidationColor(parcel.validation)}`}>
                    {parcel.validation === 'Mismatch Detected' || parcel.validation === 'Data Conflict' ? 'Alert' : 'OK'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
