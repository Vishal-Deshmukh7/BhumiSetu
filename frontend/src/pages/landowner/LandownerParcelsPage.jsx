import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../../config'

export default function LandownerParcelsPage() {
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/landowner/parcels`)
      .then((res) => res.json())
      .then((data) => setParcels(data.parcels || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 border-2 border-lo-teal border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <header className="lo-animate-in">
        <div className="text-xs font-semibold uppercase tracking-wider text-lo-teal mb-2">My Land</div>
        <h1 className="text-2xl font-bold text-lo-navy md:text-3xl">My Land Parcels</h1>
        <p className="text-sm text-lo-textSecondary mt-1">All parcels registered under your name.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {parcels.map((parcel, i) => (
          <Link
            key={parcel.parcelId}
            to={`/landowner/parcels/${parcel.parcelId}`}
            className={`lo-card p-6 hover:border-lo-teal/40 transition-all lo-animate-in lo-animate-delay-${Math.min(i + 1, 5)}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-lo-navy">{parcel.parcelId}</span>
                  <span className="text-xs text-lo-textMuted">Survey {parcel.surveyNumber}</span>
                </div>
                <div className="text-sm text-lo-textSecondary">{parcel.village}, {parcel.district}, {parcel.state}</div>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-lo-textSecondary">
                  <span>{parcel.area} ha ({parcel.areaSqFt.toLocaleString()} sq ft)</span>
                  <span>&middot;</span>
                  <span>{parcel.landType}</span>
                  <span>&middot;</span>
                  <span>{parcel.locality === 'urban' ? 'Urban' : 'Rural'}</span>
                </div>
              </div>
              <div className="text-right shrink-0 space-y-2">
                <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold ${
                  parcel.acquisitionStatus === 'Awarded' ? 'bg-lo-emeraldLight text-lo-emerald' :
                  parcel.acquisitionStatus === 'Notified' ? 'bg-lo-amberLight text-lo-amber' :
                  'bg-lo-tealLight text-lo-teal'
                }`}>{parcel.acquisitionStatus}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Compensation</div>
                <div className="text-sm font-bold text-lo-navy">Rs {parcel.compensation} Cr</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Disbursed</div>
                <div className="text-sm font-bold text-lo-emerald">Rs {parcel.compensationDisbursed} Cr</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Compensation Status</div>
                <div className="text-xs font-semibold text-lo-navy">{parcel.compensationStatus}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] text-lo-textMuted mb-1">Verification</div>
                <div className={`text-xs font-semibold ${parcel.verificationStatus === 'Verified' ? 'text-lo-emerald' : parcel.verificationStatus === 'Anomaly' ? 'text-lo-amber' : 'text-lo-navy'}`}>{parcel.verificationStatus}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-lo-textMuted mb-1">
                <span>Acquisition progress</span>
                <span>{getProgress(parcel.acquisitionStatus)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-lo-teal to-lo-emerald rounded-full" style={{ width: `${getProgress(parcel.acquisitionStatus)}%` }} />
              </div>
            </div>

            {parcel.projectIds?.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {parcel.projectIds.map((pid) => (
                  <span key={pid} className="text-[10px] font-semibold text-lo-textMuted bg-gray-100 px-2 py-0.5 rounded-full">{pid}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function getProgress(status) {
  const map = { 'Awarded': 80, 'Notified': 40, 'Compensation Stage': 60, 'Possession In Progress': 90, 'Completed': 100 }
  return map[status] || 20
}
