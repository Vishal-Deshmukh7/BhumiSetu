import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import CompensationIntelligencePage from './pages/CompensationIntelligencePage'
import MapPage from './pages/MapPage'
import ProjectWorkspacePage from './pages/ProjectWorkspacePage'
import ProjectsPage from './pages/ProjectsPage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import WorkflowPage from './pages/WorkflowPage'
import LandownerLayout from './pages/landowner/LandownerLayout'
import LandownerDashboard from './pages/landowner/LandownerDashboard'
import LandownerParcelsPage from './pages/landowner/LandownerParcelsPage'
import LandownerParcelPage from './pages/landowner/LandownerParcelPage'
import LandownerProposalsPage from './pages/landowner/LandownerProposalsPage'
import LandownerDisputesPage from './pages/landowner/LandownerDisputesPage'
import LandownerDocumentsPage from './pages/landowner/LandownerDocumentsPage'
import LandownerContactsPage from './pages/landowner/LandownerContactsPage'

function AdminLayout({ children }) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 2600)
    return () => window.clearTimeout(timer)
  }, [])

  const introWords = ['Acquisition', 'Done', 'Smoothly']

  const renderIntroWord = (word, wordIndex) => (
    <div key={word} className="intro-word" style={{ animationDelay: `${wordIndex * 260}ms` }}>
      {word.split('').map((letter, letterIndex) => (
        <span
          key={`${word}-${letter}-${letterIndex}`}
          className="intro-letter"
          style={{ animationDelay: `${(wordIndex * 260) + (letterIndex * 90)}ms` }}
        >
          {letter}
        </span>
      ))}
    </div>
  )

  const isActive = (path) => location.pathname === path
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/map', label: 'GIS Map' },
    { path: '/workflow', label: 'Workflow' },
    { path: '/compensation', label: 'COMPENSATION INTELLIGENCE' },
  ]

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-bhumisetu-cream">
      {showIntro && (
        <div className="intro-loader fixed inset-0 z-[999] flex items-center justify-center bg-bhumisetu-darkest">
          <div className="intro-stack familjen-grotesk text-center text-white">
            {introWords.map((word, index) => renderIntroWord(word, index))}
          </div>
        </div>
      )}
      {!isCollapsed && (
        <button
          type="button"
          aria-label="Close navigation backdrop"
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 z-30 cursor-default bg-bhumisetu-darkest/50 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-bhumisetu-muted/20 bg-bhumisetu-darkest text-bhumisetu-cream shadow-2xl shadow-emerald-950/20 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
        <div className="flex items-center justify-between border-b border-bhumisetu-muted/20 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-bhumisetu-brass to-bhumisetu-muted text-xs font-bold text-white">BS</div>
            <div>
              <div className="font-display text-lg font-semibold text-bhumisetu-cream">BHUMISETU</div>
              <div className="text-xs leading-tight text-bhumisetu-muted">National Land Intelligence</div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsCollapsed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-bhumisetu-cream/70 transition hover:bg-bhumisetu-forest hover:text-white"
          >
            x
          </button>
        </div>

        <nav className="space-y-1 p-4">
          <div className="px-4 py-2 text-xs font-body font-semibold uppercase tracking-wider text-bhumisetu-muted/60">Navigation</div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsCollapsed(true)}
              className={`group relative block rounded-lg px-4 py-3 text-sm font-body transition-all hover:bg-bhumisetu-forest/50 hover:text-bhumisetu-cream ${isActive(item.path) ? 'bg-bhumisetu-brass/20 font-semibold text-bhumisetu-brass shadow-lg shadow-emerald-900/20' : 'text-bhumisetu-cream/80'}`}
            >
              {isActive(item.path) && <span className="absolute bottom-2 left-1 h-5 w-1 rounded-full bg-bhumisetu-brass shadow-lg shadow-bhumisetu-brass/50" />}
              <span className="ml-2">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2 border-t border-bhumisetu-muted/20 pt-4 text-xs text-bhumisetu-muted/50">
          <div className="font-body">Real-Time National Land Acquisition &amp; Management System</div>
          <div className="text-bhumisetu-muted/30">SIH 2026 - PS 26016</div>
        </div>
      </aside>

      <main className={`min-w-0 w-full flex-1 overflow-x-hidden transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'ml-0' : 'lg:ml-64'}`}>
        <button
          type="button"
          aria-label={isCollapsed ? 'Open navigation' : 'Collapse navigation'}
          onClick={() => setIsCollapsed((value) => !value)}
          className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-bhumisetu-muted/50 bg-bhumisetu-darkest/95 text-xl text-white shadow-elevated transition hover:border-bhumisetu-brass hover:bg-bhumisetu-forest"
        >
          <span className="flex flex-col gap-1"><span className="block h-0.5 w-5 bg-white" /><span className="block h-0.5 w-5 bg-white" /><span className="block h-0.5 w-5 bg-white" /></span>
        </button>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelectionPage />} />

        <Route path="/landowner/login" element={<Navigate to="/landowner/dashboard" replace />} />
        <Route path="/landowner" element={<LandownerLayout />}>
          <Route index element={<Navigate to="/landowner/dashboard" replace />} />
          <Route path="dashboard" element={<LandownerDashboard />} />
          <Route path="parcels" element={<LandownerParcelsPage />} />
          <Route path="parcels/:parcelId" element={<LandownerParcelPage />} />
          <Route path="proposals" element={<LandownerProposalsPage />} />
          <Route path="disputes" element={<LandownerDisputesPage />} />
          <Route path="documents" element={<LandownerDocumentsPage />} />
          <Route path="contacts" element={<LandownerContactsPage />} />
        </Route>

        <Route path="/dashboard" element={<AdminLayout><DashboardPage /></AdminLayout>} />
        <Route path="/projects" element={<AdminLayout><ProjectsPage /></AdminLayout>} />
        <Route path="/projects/:projectId" element={<AdminLayout><ProjectWorkspacePage /></AdminLayout>} />
        <Route path="/map" element={<AdminLayout><MapPage /></AdminLayout>} />
        <Route path="/workflow" element={<AdminLayout><WorkflowPage /></AdminLayout>} />
        <Route path="/compensation" element={<AdminLayout><CompensationIntelligencePage /></AdminLayout>} />
        <Route path="/intelligence" element={<Navigate to="/compensation" replace />} />
        <Route path="/documents" element={<Navigate to="/compensation" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
