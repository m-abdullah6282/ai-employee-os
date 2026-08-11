import { createContext, useContext, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const login = async (email, password) => {
    const { data } = await api.post('/api/v1/auth/login', { email, password })
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    const me = await api.get('/api/v1/auth/me')
    localStorage.setItem('user', JSON.stringify(me.data))
    setUser(me.data)
    return me.data
  }

  const register = async (payload) => {
    const { data } = await api.post('/api/v1/auth/register', payload)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading: false, login, register, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
