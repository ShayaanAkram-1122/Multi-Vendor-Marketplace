import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearAccessToken,
  getAccessToken,
  getMe,
  storeAccessToken,
} from '../services/authApi'

const USER_KEY = 'vendora_user'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredUser(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY)
    return
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [loading, setLoading] = useState(true)

  const setSession = useCallback((session) => {
    if (session?.accessToken) {
      storeAccessToken(session.accessToken)
    }
    if (session?.user) {
      const nextUser = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        avatarUrl: session.user.avatarUrl || null,
      }
      writeStoredUser(nextUser)
      setUser(nextUser)
      return
    }
    clearAccessToken()
    writeStoredUser(null)
    setUser(null)
  }, [])

  const logout = useCallback(() => {
    clearAccessToken()
    writeStoredUser(null)
    setUser(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      const token = getAccessToken()
      if (!token) {
        if (!cancelled) {
          writeStoredUser(null)
          setUser(null)
          setLoading(false)
        }
        return
      }

      // Show cached user immediately while we refresh from the API
      const cached = readStoredUser()
      if (cached && !cancelled) setUser(cached)

      try {
        const data = await getMe(token)
        if (cancelled) return
        const nextUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatarUrl: data.user.avatarUrl || null,
        }
        writeStoredUser(nextUser)
        setUser(nextUser)
      } catch {
        if (!cancelled) {
          // Keep cached user if token exists but /me briefly fails;
          // only clear when there is no usable cached profile.
          if (!cached) {
            clearAccessToken()
            writeStoredUser(null)
            setUser(null)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    hydrate()
    return () => { cancelled = true }
  }, [])

  const value = useMemo(
    () => ({ user, loading, setSession, logout, isAuthenticated: Boolean(user) }),
    [user, loading, setSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
