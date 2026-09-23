import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../../config'

function StatCard({ label, value, subtext, color = 'teal', delay = 0 }) {
  const colorMap = {
    teal: 'bg-lo-tealLight text-lo-teal',
    emerald: 'bg-lo-emeraldLight text-lo-emerald',
    amber: 'bg-lo-amberLight text-lo-amber',
    red: 'bg-lo-redLight text-lo-red',
  }
  return (
    <div className={`lo-card p-5 lo-animate-in lo-animate-delay-${delay}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-2" style={{ letterSpacing: '0.08em' }}>{label}</div>
          <div className="text-2xl font-bold text-lo-navy">{value}</div>
          {subtext && <div className="text-xs text-lo-textSecondary mt-1">{subtext}</div>}
        </div>
        <div className={`h-10 w-10 rounded-lg ${colorMap[color]} flex items-center justify-center text-sm font-bold`}>
          {String(value).charAt(0)}
        </div>
      </div>
    </div>
  )
}

function NotificationItem({ notification }) {
  const priorityStyles = {
    'urgent': 'border-l-lo-red bg-lo-redLight/30',
    'action-required': 'border-l-lo-amber bg-lo-amberLight/30',
    'important': 'border-l-lo-teal bg-lo-tealLight/30',
    'informational': 'border-l-gray-300 bg-gray-50',
  }
  const priorityLabels = {
    'urgent': 'Urgent',
    'action-required': 'Action Required',
    'important': 'Important',
    'informational': 'Info',
  }
  return (
    <div className={`border-l-4 ${priorityStyles[notification.priority]} rounded-r-lg p-4 lo-animate-in`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="text-sm font-semibold text-lo-navy">{notification.title}</div>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-lo-textMuted">{priorityLabels[notification.priority]}</span>
      </div>
      <div className="text-xs text-lo-textSecondary leading-relaxed">{notification.message}</div>
      <div className="text-[10px] text-lo-textMuted mt-2">{notification.date}</div>
    </div>
  )
}

export default function LandownerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/landowner/dashboard`)
      .then((res) => { if (!res.ok) throw new Error('Failed to load dashboard'); return res.json() })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-lo-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-lo-textSecondary">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="lo-card p-8 text-center max-w-md">
          <div className="text-lo-red text-sm font-semibold mb-2">Unable to load dashboard</div>
          <div className="text-xs text-lo-textSecondary">{error}</div>
        </div>
      </div>
    )
  }

  const { profile, parcels, activeProposalCount, activeDisputeCount, nextHearing, recentNotifications } = data

  return (
    <div className="space-y-8">
      <header className="lo-animate-in">
        <div className="text-xs font-semibold uppercase tracking-wider text-lo-teal mb-2" style={{ letterSpacing: '0.08em' }}>Welcome back</div>
        <h1 className="text-3xl font-bold text-lo-navy md:text-4xl">{profile.name}</h1>
        <p className="text-sm text-lo-textSecondary mt-1">{profile.village}, {profile.district}, {profile.state}</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Parcels" value={parcels.length} subtext="Registered land parcels" color="teal" delay={1} />
        <StatCard label="Active Proposals" value={activeProposalCount} subtext="Acquisition proposals" color="amber" delay={2} />
        <StatCard label="Open Disputes" value={activeDisputeCount} subtext="Active proceedings" color="red" delay={3} />
        <StatCard label="Next Hearing" value={nextHearing ? new Date(nextHearing.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'None'} subtext={nextHearing?.type || 'No upcoming hearings'} color="emerald" delay={4} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-lo-navy">My Land Parcels</h2>
            <Link to="/landowner/parcels" className="text-xs font-semibold text-lo-teal hover:text-lo-navy transition-colors">View all</Link>
          </div>
          {parcels.map((parcel, i) => (
            <Link
              key={parcel.parcelId}
              to={`/landowner/parcels/${parcel.parcelId}`}
              className={`lo-card block p-5 hover:border-lo-teal/40 transition-all lo-animate-in lo-animate-delay-${Math.min(i + 1, 5)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-lo-navy">{parcel.parcelId}</span>
                    <span className="text-xs text-lo-textMuted">Survey {parcel.surveyNumber}</span>
                  </div>
                  <div className="text-sm text-lo-textSecondary">{parcel.village}, {parcel.district}</div>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    <span className="text-lo-textSecondary">{parcel.area} ha &middot; {parcel.landType}</span>
                    <span className="text-lo-textSecondary">&middot;</span>
                    <span className="text-lo-textSecondary">{parcel.areaSqFt.toLocaleString()} sq ft</span>
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-2">
                  <StatusBadge status={parcel.acquisitionStatus} />
                  <div className="text-xs text-lo-textMuted">
                    {parcel.compensationDisbursed > 0 ? `Rs ${parcel.compensationDisbursed} Cr paid` : 'Awaiting compensation'}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-lo-textMuted mb-1">
                  <span>Acquisition progress</span>
                  <span>{getAcquisitionProgress(parcel.acquisitionStatus)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-lo-teal to-lo-emerald rounded-full transition-all" style={{ width: `${getAcquisitionProgress(parcel.acquisitionStatus)}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="space-y-6">
          {nextHearing && (
            <div className="lo-card p-5 border-lo-teal/30 bg-lo-tealLight/20 lo-animate-in lo-animate-delay-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-lo-teal mb-3">Upcoming Hearing</div>
              <div className="text-lg font-bold text-lo-navy">{nextHearing.date}</div>
              <div className="text-sm text-lo-textSecondary mt-1">{nextHearing.type}</div>
              <div className="text-xs text-lo-textSecondary mt-2">{nextHearing.venue}</div>
              <div className="text-xs text-lo-textMuted mt-1">{nextHearing.time}</div>
              <Link to="/landowner/disputes" className="mt-4 inline-flex text-xs font-semibold text-lo-teal hover:text-lo-navy transition-colors">
                View hearing timeline &rarr;
              </Link>
            </div>
          )}

          <div className="lo-card p-5 lo-animate-in lo-animate-delay-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted">Recent Notifications</div>
              <span className="text-[10px] font-semibold text-lo-teal bg-lo-tealLight px-2 py-0.5 rounded-full">{recentNotifications.filter((n) => !n.read).length} unread</span>
            </div>
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <NotificationItem key={notification.notificationId} notification={notification} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    'Awarded': 'bg-lo-emeraldLight text-lo-emerald',
    'Notified': 'bg-lo-amberLight text-lo-amber',
    'Compensation Stage': 'bg-lo-tealLight text-lo-teal',
    'Possession In Progress': 'bg-lo-redLight text-lo-red',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function getAcquisitionProgress(status) {
  const map = { 'Awarded': 80, 'Notified': 40, 'Compensation Stage': 60, 'Possession In Progress': 90, 'Completed': 100 }
  return map[status] || 20
}
