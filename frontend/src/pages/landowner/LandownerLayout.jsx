import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'

const navItems = [
  { path: '/landowner/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/landowner/parcels', label: 'My Land', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { path: '/landowner/proposals', label: 'Proposals', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: '/landowner/disputes', label: 'Disputes', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { path: '/landowner/documents', label: 'Documents', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { path: '/landowner/contacts', label: 'Contacts', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
]

function LandownerLayoutInner() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <div className="lo-layout">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-lo-navy/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-lo-border bg-white transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-lo-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lo-navy text-xs font-bold text-white">BS</div>
          <div>
            <div className="text-sm font-bold text-lo-navy tracking-tight">BHUMISETU</div>
            <div className="text-[10px] text-lo-textMuted uppercase tracking-wider">Landowner Portal</div>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-lo-tealLight text-lo-teal'
                  : 'text-lo-textSecondary hover:bg-gray-50 hover:text-lo-text'
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-lo-border p-4">
          <div className="text-[11px] font-medium text-lo-text truncate mb-2">Affected Landowner</div>
          <div className="text-[10px] text-lo-textMuted mb-3">Direct access portal</div>
          <div className="text-[10px] uppercase tracking-wider text-lo-textMuted">Synthetic demo mode</div>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-lo-border bg-white/90 backdrop-blur-sm px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-lo-border text-lo-textSecondary hover:bg-gray-50 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-xs font-medium text-lo-textMuted hover:text-lo-text transition-colors">
            Exit to role selection
          </Link>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function LandownerLayout() {
  return <LandownerLayoutInner />
}
