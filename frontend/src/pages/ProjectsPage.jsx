import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRiskScoreBadge } from '../utils/risk'
import { API_BASE } from '../config'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch((error) => console.error('Project load failed:', error))
  }, [])

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-900'
      case 'in progress': return 'bg-blue-100 text-blue-900'
      case 'pending': return 'bg-gray-100 text-gray-900'
      default: return 'bg-gray-100 text-gray-900'
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div>
          <div className="text-xs font-body font-semibold text-bhumisetu-muted uppercase tracking-wider mb-2">Project Explorer</div>
          <h1 className="font-display text-5xl leading-tight text-bhumisetu-darkest">Project Portfolio</h1>
        </div>
        <button className="px-6 py-3 bg-bhumisetu-forest text-white rounded-lg font-body font-semibold hover:bg-bhumisetu-darkest transition-colors">
          New Search
        </button>
      </header>

      {/* Projects Grid */}
      <section className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="font-body text-gray-600">No projects found</div>
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-bhumisetu-brass hover:shadow-elevated transition-all"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Project Info */}
                <div className="col-span-4">
                  <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-1">{project.id}</div>
                  <div className="font-display text-xl text-bhumisetu-darkest mb-2">{project.name}</div>
                  <div className="text-sm text-gray-600 font-body">{project.state} • {project.district}</div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Status</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                {/* Risk */}
                <div className="col-span-2">
                  <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Risk</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRiskScoreBadge(project.riskScore).badgeClass}`}>
                    {project.riskScore} · {getRiskScoreBadge(project.riskScore).shortLabel}
                  </span>
                </div>

                {/* Progress */}
                <div className="col-span-3 text-right">
                  <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Progress</div>
                  <div className="flex items-center gap-3 justify-end">
                    <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden max-w-xs">
                      <div
                        className="h-full bg-gradient-to-r from-bhumisetu-forest to-bhumisetu-muted"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-bhumisetu-darkest min-w-fit">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  )
}
