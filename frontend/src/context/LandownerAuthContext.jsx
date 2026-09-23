import { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE } from '../config'

const LandownerAuthContext = createContext(null)

export function LandownerAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('lo_token')
    if (saved) {
      setToken(saved)
      fetch(`${API_BASE}/landowner/auth/me`, {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(({ user: u }) => setUser(u))
        .catch(() => {
          localStorage.removeItem('lo_token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE}/landowner/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Login failed')
    }
    const { token: t, user: u } = await res.json()
    localStorage.setItem('lo_token', t)
    setToken(t)
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('lo_token')
    setToken(null)
    setUser(null)
  }

  return (
    <LandownerAuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </LandownerAuthContext.Provider>
  )
}

export function useLandownerAuth() {
  return useContext(LandownerAuthContext)
}
