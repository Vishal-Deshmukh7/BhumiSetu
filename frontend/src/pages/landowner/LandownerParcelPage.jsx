import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { API_BASE } from '../../config'

function FlyToParcel({ parcel }) {
  const map = useMap()
  useEffect(() => {
    if (parcel?.coordinates) {
      map.setView([parcel.coordinates.latitude, parcel.coordinates.longitude], 14, { duration: 0.8 })
    }
  }, [map, parcel])
  return null
}

function getPositions(parcel) {
  if (!parcel?.coordinates) return []
  const { latitude: lat, longitude: lng } = parcel.coordinates
  const s = 0.012
  return [
    [lat - s, lng - s],
    [lat - s * 0.72, lng + s],
    [lat + s, lng + s * 0.84],
    [lat + s * 0.82, lng - s],
    [lat - s, lng - s],
  ]
}

const acquisitionSteps = ['Verification', 'Notification', 'Award', 'Compensation', 'Possession']

function StepProgress({ currentStage }) {
  const stageIndex = acquisitionSteps.findIndex((s) => currentStage?.toLowerCase().includes(s.toLowerCase()))
  const currentIndex = stageIndex >= 0 ? stageIndex : 0

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {acquisitionSteps.map((step, i) => {
        const isComplete = i < currentIndex
        const isCurrent = i === currentIndex
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center min-w-[80px]">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                isComplete ? 'bg-lo-teal text-white border-lo-teal' :
                isCurrent ? 'bg-lo-amberLight text-lo-amber border-lo-amber' :
                'bg-gray-50 text-lo-textMuted border-gray-200'
              }`}>
                {isComplete ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                ) : i + 1}
              </div>
              <div className={`text-[10px] mt-1.5 text-center font-medium ${isCurrent ? 'text-lo-amber' : isComplete ? 'text-lo-teal' : 'text-lo-textMuted'}`}>{step}</div>
            </div>
            {i < acquisitionSteps.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-12 mt-[-14px] ${isComplete ? 'bg-lo-teal' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-lo-textMuted">{label}</span>
      <span className="text-sm font-medium text-lo-navy text-right">{value}</span>
    </div>
  )
}

export default function LandownerParcelPage() {
  const { parcelId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!parcelId) return
    let cancelled = false
    setError('')
    fetch(`${API_BASE}/landowner/parcels/${parcelId}`)
      .then((res) => { if (!res.ok) throw new Error('Parcel not found'); return res.json() })
      .then((data) => { if (!cancelled) setData(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [parcelId])

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="lo-card p-8 text-center text-lo-red text-sm">{error}</div>
  if (!data?.parcel) return <div className="lo-card p-8 text-center text-lo-textSecondary text-sm">Parcel not found.</div>

  const { parcel, proposals, disputes } = data
  const positions = getPositions(parcel)

  return (
    <div className="space-y-6">
      <header className="lo-animate-in">
        <Link to="/landowner/parcels" className="text-xs font-semibold text-lo-teal hover:text-lo-navy transition-colors">&larr; All parcels</Link>
        <h1 className="text-2xl font-bold text-lo-navy mt-2">{parcel.parcelId}</h1>
        <p className="text-sm text-lo-textSecondary">Survey Number: {parcel.surveyNumber} &middot; {parcel.village}, {parcel.district}</p>
      </header>

      <section className="lo-card p-6 lo-animate-in lo-animate-delay-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-4">Acquisition Progress</div>
        <StepProgress currentStage={parcel.acquisitionStatus} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="lo-card p-6 lo-animate-in lo-animate-delay-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-4">Parcel Details</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatMini label="Area" value={`${parcel.area} ha`} />
              <StatMini label="Land Type" value={parcel.landType} />
              <StatMini label="Locality" value={parcel.locality === 'urban' ? 'Urban' : 'Rural'} />
              <StatMini label="Verification" value={parcel.verificationStatus} />
            </div>
            <div className="mt-4 space-y-0">
              <DetailRow label="Survey Number" value={parcel.surveyNumber} />
              <DetailRow label="Village" value={parcel.village} />
              <DetailRow label="District" value={parcel.district} />
              <DetailRow label="State" value={parcel.state} />
              <DetailRow label="Total Area" value={`${parcel.area} ha (${parcel.areaSqFt.toLocaleString()} sq ft)`} />
              <DetailRow label="Coordinates" value={`${parcel.coordinates.latitude.toFixed(4)}, ${parcel.coordinates.longitude.toFixed(4)}`} />
            </div>
          </section>

          <section className="lo-card p-6 lo-animate-in lo-animate-delay-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-4">Compensation Status</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-lo-tealLight/30">
                <div className="text-xs text-lo-textMuted mb-1">Total Awarded</div>
                <div className="text-xl font-bold text-lo-navy">Rs {parcel.compensation} Cr</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-lo-emeraldLight/30">
                <div className="text-xs text-lo-textMuted mb-1">Disbursed</div>
                <div className="text-xl font-bold text-lo-emerald">Rs {parcel.compensationDisbursed} Cr</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-lo-amberLight/30">
                <div className="text-xs text-lo-textMuted mb-1">Pending</div>
                <div className="text-xl font-bold text-lo-amber">Rs {parcel.compensationPending} Cr</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-lo-textMuted mb-1">
                <span>Disbursement progress</span>
                <span>{parcel.compensation > 0 ? Math.round((parcel.compensationDisbursed / parcel.compensation) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-lo-teal to-lo-emerald rounded-full" style={{ width: `${parcel.compensation > 0 ? (parcel.compensationDisbursed / parcel.compensation) * 100 : 0}%` }} />
              </div>
            </div>
          </section>

          {positions.length > 0 && (
            <section className="lo-card overflow-hidden lo-animate-in lo-animate-delay-4">
              <div className="p-4 border-b border-lo-border">
                <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted">Map Location</div>
              </div>
              <div className="h-[320px]">
                <MapContainer center={[parcel.coordinates.latitude, parcel.coordinates.longitude]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  <FlyToParcel parcel={parcel} />
                  <Polygon
                    positions={positions}
                    pathOptions={{ color: '#0D9488', fillColor: '#0D9488', fillOpacity: 0.35, weight: 3 }}
                  />
                </MapContainer>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="lo-card p-5 lo-animate-in lo-animate-delay-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-3">Quick Status</div>
            <div className="space-y-3">
              <StatusRow label="Acquisition" status={parcel.acquisitionStatus} />
              <StatusRow label="Compensation" status={parcel.compensationStatus} />
              <StatusRow label="Possession" status={parcel.possessionStatus} />
              <StatusRow label="Verification" status={parcel.verificationStatus} />
            </div>
          </section>

          {proposals?.length > 0 && (
            <section className="lo-card p-5 lo-animate-in lo-animate-delay-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-3">Active Proposals</div>
              <div className="space-y-2">
                {proposals.map((p) => (
                  <Link key={p.proposalId} to="/landowner/proposals" className="block p-3 rounded-lg border border-lo-border hover:border-lo-teal/40 transition-colors">
                    <div className="text-sm font-semibold text-lo-navy">{p.projectName}</div>
                    <div className="text-[10px] text-lo-textMuted mt-1">Rs {p.totalCompensation} Cr &middot; {p.acquisitionStage}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {disputes?.length > 0 && (
            <section className="lo-card p-5 border-lo-red/20 bg-lo-redLight/10 lo-animate-in lo-animate-delay-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-lo-red mb-3">Active Disputes</div>
              {disputes.map((d) => (
                <Link key={d.disputeId} to="/landowner/disputes" className="block">
                  <div className="text-sm font-semibold text-lo-navy">{d.disputeId}</div>
                  <div className="text-[10px] text-lo-textSecondary mt-1">{d.disputeType}</div>
                  <div className="text-[10px] text-lo-textMuted mt-1">{d.status} &middot; {d.currentStage}</div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function StatMini({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
      <div className="text-[10px] text-lo-textMuted mb-1">{label}</div>
      <div className="text-sm font-semibold text-lo-navy">{value}</div>
    </div>
  )
}

function StatusRow({ label, status }) {
  const dotColors = {
    'Awarded': 'bg-lo-emerald',
    'Verified': 'bg-lo-emerald',
    'Paid': 'bg-lo-emerald',
    'Notified': 'bg-lo-amber',
    'Partially Paid': 'bg-lo-amber',
    'Awaiting Approval': 'bg-lo-amber',
    'Anomaly': 'bg-lo-red',
    'Mismatch Detected': 'bg-lo-red',
    'In Process': 'bg-lo-teal',
    'Pending': 'bg-gray-400',
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-lo-textSecondary">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${dotColors[status] || 'bg-gray-300'}`} />
        <span className="text-xs font-medium text-lo-navy">{status}</span>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}
