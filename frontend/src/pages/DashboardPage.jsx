import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { getRiskScoreBadge } from '../utils/risk'
import { API_BASE } from '../config'

function StatCard({ label, value, subtext }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-subtle">
      <div className="text-xs font-body font-semibold text-gray-500 uppercase tracking-wider mb-3">{label}</div>
      <div className="font-display text-3xl font-400 text-bhumisetu-darkest mb-2">{value}</div>
      <div className="text-sm text-gray-600 font-body">{subtext}</div>
    </div>
  )
}

function AlertItem({ alert }) {
  const severityConfig = {
    high: { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-900' },
    medium: { bg: 'bg-amber-50', border: 'border-l-amber-500', text: 'text-amber-900' },
    low: { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-900' },
  }
  
  const config = severityConfig[alert.severity.toLowerCase()] || severityConfig.low
  
  return (
    <div className={`${config.bg} border-l-4 ${config.border} rounded-lg p-4 ${config.text}`}>
      <div className="font-body font-semibold mb-1">{alert.title}</div>
      <div className="text-sm font-body text-gray-700">{alert.message}</div>
    </div>
  )
}

function ProjectCard({ project, isSelected, onClick }) {
  const riskBadge = getRiskScoreBadge(project.riskScore)
  
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border-2 transition-all font-body ${
        isSelected
          ? 'border-bhumisetu-brass bg-yellow-50 shadow-elevated'
          : 'border-gray-200 bg-gray-50 hover:border-bhumisetu-brass hover:bg-yellow-25'
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-3">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{project.id}</div>
          <div className="text-lg font-display font-500 text-bhumisetu-darkest mt-1">{project.name}</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskBadge.badgeClass}`}>
          {riskBadge.shortLabel}
        </span>
      </div>
      
      <div className="flex gap-2 flex-wrap mb-3 text-xs text-gray-600 font-body">
        <span>{project.state}</span>
        <span>•</span>
        <span>{project.district}</span>
        <span>•</span>
        <span>{project.status}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-bhumisetu-forest to-bhumisetu-muted"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="text-sm font-bold text-bhumisetu-darkest">{project.progress}%</span>
      </div>
    </button>
  )
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        setDashboard(data)
        setSelectedProject(data.projects?.[0] ?? null)
      })
      .catch((error) => console.error('Dashboard load failed:', error))
  }, [])

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <div className="text-center">
          <div className="font-display text-2xl mb-2">Loading</div>
          <div className="font-body">National Land Acquisition Command View</div>
        </div>
      </div>
    )
  }

  const summary = dashboard.summary
  const project = selectedProject ?? dashboard.projects[0]
  const riskBadge = getRiskScoreBadge(project?.riskScore)

  const exportReport = () => {
    const pdf = new jsPDF()
    const line = (text, y, size = 11) => {
      pdf.setFontSize(size)
      pdf.text(String(text), 20, y)
    }

    pdf.setTextColor(8, 18, 15)
    line('BHUMISETU | National Land Acquisition Summary Report', 22, 16)
    line(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 31, 9)
    line('PROJECT SUMMARY', 46, 13)
    line(`Selected project: ${project.name} (${project.id})`, 56)
    line(`Location: ${project.state} | ${project.district}`, 64)
    line(`Status: ${project.status} | Progress: ${project.progress}%`, 72)
    line(`Risk score: ${project.riskScore}/100 | ${riskBadge.label}`, 80)
    line('OVERVIEW METRICS', 96, 13)
    line(`Total land area: ${project.totalLandArea ?? project.proposedArea} ha`, 106)
    line(`Acquired land: ${project.acquiredLandArea ?? project.acquiredArea} ha`, 114)
    line(`Affected families: ${project.families}`, 122)
    line('CRITICAL ALERTS', 138, 13)
    dashboard.alerts.slice(0, 5).forEach((alert, index) => {
      line(`${index + 1}. ${alert.title} - ${alert.message}`, 148 + index * 9, 9)
    })
    const alertEnd = 148 + Math.min(dashboard.alerts.length, 5) * 9
    line('LAND PARCELS OVERVIEW', alertEnd + 10, 13)
    line(`Portfolio projects: ${dashboard.projects.length}`, alertEnd + 20)
    line(`Acquired vs pending: ${project.acquiredLandArea ?? project.acquiredArea} ha / ${(project.totalLandArea ?? project.proposedArea) - (project.acquiredLandArea ?? project.acquiredArea)} ha`, alertEnd + 28)
    line('COMPENSATION STATUS', alertEnd + 44, 13)
    line(`Assessed value: ₹${project.compensation ?? summary.compensationAssessed} Cr`, alertEnd + 54)
    line(`Total disbursed: ₹${project.compensationDisbursed ?? summary.compensationDisbursed} Cr`, alertEnd + 62)
    line(`Pending payment: ₹${(project.compensation ?? summary.compensationAssessed) - (project.compensationDisbursed ?? summary.compensationDisbursed)} Cr`, alertEnd + 70)
    pdf.save(`bhumisetu-summary-${project.id}.pdf`)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div>
          <div className="text-xs font-body font-semibold text-bhumisetu-muted uppercase tracking-wider mb-2">Prototype Status</div>
          <h1 className="font-display text-5xl leading-tight text-bhumisetu-darkest">National Land Acquisition Command View</h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          <span className="px-4 py-2 rounded-full bg-green-100 text-green-900 text-xs font-bold">Live Demo</span>
          <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">Maharashtra</span>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Projects" value={summary.totalProjects} subtext="Across active corridors" />
        <StatCard label="Land Proposed" value={`${summary.landProposed} ha`} subtext="Current footprint" />
        <StatCard label="Land Notified" value={`${summary.landNotified} ha`} subtext="Acquisition notices" />
        <StatCard label="Land Acquired" value={`${summary.landAcquired} ha`} subtext="Award & possession" />
        <StatCard label="Compensation" value={`₹${summary.compensationAssessed}Cr`} subtext="Current valuation" />
        <StatCard label="Disbursed" value={`₹${summary.compensationDisbursed}Cr`} subtext="Payments released" />
      </section>

      {/* Progress & Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State-wise Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-2xl text-bhumisetu-darkest">State-wise Progress</h2>
            <button onClick={exportReport} type="button" className="px-4 py-2 text-sm font-body font-semibold text-bhumisetu-brass border border-bhumisetu-brass rounded-lg hover:bg-yellow-50 transition-colors">
              Export
            </button>
          </div>
          
          <div className="space-y-6">
            {summary.stateBreakdown.map((state) => (
              <div key={state.name}>
                <div className="flex justify-between items-center mb-2 font-body">
                  <span className="text-gray-700">{state.name}</span>
                  <strong className="text-bhumisetu-darkest">{state.value}%</strong>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-bhumisetu-forest to-bhumisetu-muted transition-all"
                    style={{ width: `${state.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
          <h2 className="font-display text-2xl text-bhumisetu-darkest mb-6">Critical Alerts</h2>
          <div className="space-y-4">
            {dashboard.alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </section>

      {/* Project Portfolio */}
      <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display text-2xl text-bhumisetu-darkest">Project Portfolio</h2>
          <Link to="/projects" className="px-4 py-2 text-sm font-body font-semibold text-bhumisetu-brass border border-bhumisetu-brass rounded-lg hover:bg-yellow-50 transition-colors">
            View all
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboard.projects.map((item) => (
            <ProjectCard
              key={item.id}
              project={item}
              isSelected={project.id === item.id}
              onClick={() => setSelectedProject(item)}
            />
          ))}
        </div>
      </section>

      {/* Project Details */}
      {project && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
              <h3 className="font-display text-2xl text-bhumisetu-darkest mb-6">Operational Snapshot</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Acquired Area</div>
                  <div className="font-display text-3xl text-bhumisetu-darkest">{project.acquiredArea} <span className="text-lg text-gray-500">ha</span></div>
                </div>
                <div>
                  <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Families</div>
                  <div className="font-display text-3xl text-bhumisetu-darkest">{project.families}</div>
                </div>
                <div>
                  <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">R&R Progress</div>
                  <div className="font-display text-3xl text-bhumisetu-darkest">{project.rr}%</div>
                </div>
                <div>
                  <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Possession</div>
                  <div className="font-display text-3xl text-bhumisetu-darkest">{project.possession}%</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
              <h3 className="font-display text-2xl text-bhumisetu-darkest mb-6">Lifecycle Flow</h3>
              <div className="space-y-3">
                {project.milestones.map((milestone) => (
                  <div key={milestone.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 font-body">
                    <span className="text-gray-700">{milestone.name}</span>
                    <span className="text-sm font-semibold text-bhumisetu-darkest bg-yellow-100 px-3 py-1 rounded-full">
                      {milestone.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className={`bg-gradient-to-br ${riskBadge.panelClass} rounded-2xl p-8 border`}>
            <h3 className="font-display text-2xl text-bhumisetu-darkest mb-4">Risk Assessment</h3>
            <div className={`font-display text-6xl font-bold ${riskBadge.textClass} mb-2`}>{project.riskScore}</div>
            <div className="text-sm text-gray-700 font-body mb-6">{riskBadge.label}</div>
            <ul className="space-y-2 text-sm text-gray-700 font-body">
              {dashboard.risk.factors.map((factor) => (
                <li key={factor} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
