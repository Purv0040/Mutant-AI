import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mutant_token'))
  const [user, setUser] = useState(() => {
    try {
      const t = localStorage.getItem('mutant_token')
      if (!t) return null
      // Decode JWT payload (Base64) — no verification needed client-side
      const payload = JSON.parse(atob(t.split('.')[1]))
      return { email: payload.sub, username: payload.username }
    } catch {
      return null
    }
  })

  const login = (newToken) => {
    localStorage.setItem('mutant_token', newToken)
    setToken(newToken)
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      setUser({ email: payload.sub, username: payload.username })
    } catch {
      setUser(null)
    }
  }

  const logout = () => {
    localStorage.removeItem('mutant_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
