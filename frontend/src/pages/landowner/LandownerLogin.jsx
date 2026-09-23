import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LandownerAuthProvider, useLandownerAuth } from '../../context/LandownerAuthContext'

function LoginForm() {
  const { login } = useLandownerAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
      navigate('/landowner/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-lo-navy text-lg font-bold text-white mb-4">BS</div>
          <h1 className="text-2xl font-bold text-lo-navy" style={{ fontFamily: "'DM Serif Display', serif" }}>BHUMISETU</h1>
          <p className="text-sm text-lo-textMuted mt-1">Landowner Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-lo-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-lo-navy mb-4">Sign in</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <label className="block mb-3">
            <span className="text-xs font-medium text-lo-textSecondary">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-lo-border px-3 py-2.5 text-sm text-lo-text focus:border-lo-teal focus:ring-1 focus:ring-lo-teal outline-none"
              placeholder="e.g. ramesh"
            />
          </label>

          <label className="block mb-5">
            <span className="text-xs font-medium text-lo-textSecondary">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-lo-border px-3 py-2.5 text-sm text-lo-text focus:border-lo-teal focus:ring-1 focus:ring-lo-teal outline-none"
              placeholder="Enter password"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-lo-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-lo-teal/90 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="/" className="text-xs text-lo-textMuted hover:text-lo-text transition-colors">
            Back to role selection
          </a>
        </div>
      </div>
    </div>
  )
}

export default function LandownerLogin() {
  return (
    <LandownerAuthProvider>
      <LoginForm />
    </LandownerAuthProvider>
  )
}
