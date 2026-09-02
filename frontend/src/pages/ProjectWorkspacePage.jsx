import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getRiskScoreBadge } from '../utils/risk'
import { API_BASE } from '../config'

export default function ProjectWorkspacePage() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [parcels, setParcels] = useState([])

  useEffect(() => {
    if (!projectId) return

    fetch(`${API_BASE}/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => setProject(data.project))
      .catch((error) => console.error('Project fetch failed:', error))

    fetch(`${API_BASE}/projects/${projectId}/parcels`)
      .then((res) => res.json())
      .then((data) => setParcels(data.parcels || []))
      .catch((error) => console.error('Parcel fetch failed:', error))
  }, [projectId])

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <div className="text-center">
          <div className="font-display text-2xl mb-2">Loading</div>
          <div className="font-body">Project Workspace</div>
        </div>
      </div>
    )
  }

  const riskBadge = getRiskScoreBadge(project.riskScore)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-body font-semibold text-bhumisetu-muted uppercase tracking-wider mb-2">Project Workspace</div>
            <h1 className="font-display text-5xl leading-tight text-bhumisetu-darkest">{project.name}</h1>
            <div className="text-gray-600 font-body mt-2">{project.state} • {project.district}</div>
          </div>
          <Link
            to="/projects"
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-body font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </header>

      {/* Overview Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
          <h2 className="font-display text-2xl text-bhumisetu-darkest mb-6">Project Overview</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Status</div>
              <div className="font-display text-3xl text-bhumisetu-darkest">{project.status}</div>
            </div>
            <div>
              <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Progress</div>
              <div className="font-display text-3xl text-bhumisetu-darkest">{project.progress}%</div>
            </div>
            <div>
              <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Families Affected</div>
              <div className="font-display text-3xl text-bhumisetu-darkest">{project.families}</div>
            </div>
            <div>
              <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Acquired Area</div>
              <div className="font-display text-3xl text-bhumisetu-darkest">{project.acquiredArea} <span className="text-lg text-gray-500">ha</span></div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className={`bg-gradient-to-br ${riskBadge.panelClass} rounded-2xl p-8 border`}>
          <h2 className="font-display text-2xl text-bhumisetu-darkest mb-4">Decision Support</h2>
          <div className={`font-display text-6xl font-bold ${riskBadge.textClass} mb-2`}>
            {project.riskScore}
          </div>
          <div className="text-sm text-gray-700 font-body mb-6">{riskBadge.label}</div>
          <ul className="space-y-3 text-sm text-gray-700 font-body">
            <li className="flex items-start gap-2">
              <span className="text-bhumisetu-brass mt-1">•</span>
              <span>Compensation exceptions require review.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-bhumisetu-brass mt-1">•</span>
              <span>Parcel data mismatch detected.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-bhumisetu-brass mt-1">•</span>
              <span>R&R follow-up pending.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Parcel Watchlist */}
      <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
        <h2 className="font-display text-2xl text-bhumisetu-darkest mb-6">Land Parcel Watchlist</h2>
        
        {parcels.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No parcels found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Parcel ID</th>
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Village</th>
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Area</th>
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Compensation</th>
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Possession</th>
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Validation</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((parcel) => (
                  <tr key={parcel.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-body font-semibold text-bhumisetu-darkest">{parcel.id}</td>
                    <td className="px-4 py-4 text-gray-700 font-body">{parcel.village}</td>
                    <td className="px-4 py-4 text-gray-700 font-body">{parcel.area} ha</td>
                    <td className="px-4 py-4 text-gray-700 font-body">₹{parcel.compensation}Cr</td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                        {parcel.possession}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900">
                        {parcel.validation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Milestones */}
      {project.milestones && (
        <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
          <h2 className="font-display text-2xl text-bhumisetu-darkest mb-6">Lifecycle Flow</h2>
          <div className="space-y-3">
            {project.milestones.map((milestone) => (
              <div key={milestone.name} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 font-body">
                <span className="text-gray-700">{milestone.name}</span>
                <span className="text-sm font-semibold text-bhumisetu-darkest bg-yellow-100 px-3 py-1 rounded-full">
                  {milestone.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
