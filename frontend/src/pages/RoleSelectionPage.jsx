import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const roles = [
  {
    key: 'authority',
    mark: 'AA',
    title: 'Acquiring Authority',
    description: 'Manage land acquisition projects, workflows, GIS data, notifications, and compensation processes.',
  },
  {
    key: 'administrator',
    mark: 'AD',
    title: 'Administrator',
    description: 'Monitor platform operations, system-level workflows, and nationwide acquisition progress.',
  },
  {
    key: 'landowner',
    mark: 'AL',
    title: 'Affected Landowner',
    description: 'Access land parcel information, submit documents, and track acquisition and compensation status.',
  },
]

function RoleSelectionPage() {
  const navigate = useNavigate()
  const [showLandownerModal, setShowLandownerModal] = useState(false)

  const selectRole = (roleKey) => {
    if (roleKey === 'landowner') {
      setShowLandownerModal(true)
      return
    }

    navigate('/dashboard')
  }

  return (
    <main className="role-selection-page flex min-h-screen items-center justify-center px-4 py-12 md:px-8">
      <div className="w-full max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-bhumisetu-muted/30 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted shadow-subtle">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-bhumisetu-darkest text-[10px] font-bold text-bhumisetu-cream">BS</span>
            Stakeholder portal selection
          </div>
          <h1 className="font-display text-4xl leading-tight text-bhumisetu-darkest md:text-6xl">Select Your Portal</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-bhumisetu-forest/80 md:text-base">
            Choose your role to access the National Land Acquisition &amp; Management System.
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-bhumisetu-muted">
            Prototype role selection - access pathways for future stakeholder portals
          </p>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-3" aria-label="Available stakeholder roles">
          {roles.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => selectRole(role.key)}
              className="role-card group text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="role-card-mark">{role.mark}</span>
                <span className="role-card-arrow" aria-hidden="true">&gt;</span>
              </div>
              <h2 className="mt-8 font-display text-2xl text-bhumisetu-darkest">{role.title}</h2>
              <p className="mt-3 text-sm leading-6 text-bhumisetu-forest/75">{role.description}</p>
              <span className="mt-8 inline-flex text-xs font-bold uppercase tracking-wider text-bhumisetu-muted transition-colors group-hover:text-bhumisetu-darkest">
                Continue to portal
              </span>
            </button>
          ))}
        </section>

        <footer className="mt-10 text-center text-xs text-bhumisetu-muted">
          BHUMISETU - National Land Intelligence
        </footer>
      </div>

      {showLandownerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bhumisetu-darkest/65 p-4" role="presentation" onMouseDown={() => setShowLandownerModal(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="landowner-portal-title"
            className="w-full max-w-lg rounded-2xl border border-bhumisetu-muted/20 bg-white p-6 shadow-2xl md:p-8"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bhumisetu-cream text-sm font-bold text-bhumisetu-forest">AL</div>
            <h2 id="landowner-portal-title" className="mt-5 font-display text-3xl text-bhumisetu-darkest">Landowner Portal</h2>
            <p className="mt-4 text-base leading-7 text-bhumisetu-forest">
              The Landowner Portal is currently under development and will be available in an upcoming release.
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Our team is actively building features for landowners including parcel information, document submission, compensation tracking, and acquisition status monitoring.
            </p>
            <button
              type="button"
              onClick={() => setShowLandownerModal(false)}
              className="mt-7 rounded-lg bg-bhumisetu-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-bhumisetu-darkest"
            >
              Back to Role Selection
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

export default RoleSelectionPage
