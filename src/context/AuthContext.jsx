import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mutant_token'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mutant_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        localStorage.removeItem('mutant_user')
      }
    }

    try {
      const t = localStorage.getItem('mutant_token')
      if (!t) return null
      const payload = JSON.parse(atob(t.split('.')[1]))
      return { email: payload.sub, name: payload.username || payload.sub }
    } catch {
      return null
    }
  })

  const login = (newToken, newUser = null) => {
    localStorage.setItem('mutant_token', newToken)
    setToken(newToken)

    if (newUser) {
      localStorage.setItem('mutant_user', JSON.stringify(newUser))
      setUser(newUser)
      return
    }

    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      const fallbackUser = { email: payload.sub, name: payload.username || payload.sub }
      localStorage.setItem('mutant_user', JSON.stringify(fallbackUser))
      setUser(fallbackUser)
    } catch {
      setUser(null)
    }
  }

  const logout = () => {
    localStorage.removeItem('mutant_token')
    localStorage.removeItem('mutant_user')
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
