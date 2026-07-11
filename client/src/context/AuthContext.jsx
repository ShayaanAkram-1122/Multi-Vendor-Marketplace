import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearAccessToken,
  getAccessToken,
  getMe,
  refreshSession,
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

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl || null,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [loading, setLoading] = useState(true)

  const setSession = useCallback((session) => {
    if (session?.accessToken) {
      storeAccessToken(session.accessToken)
    }
    if (session?.user) {
      const nextUser = toPublicUser(session.user)
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
      const cached = readStoredUser()

      // No access token and no cached profile → logged out
      if (!token && !cached) {
        if (!cancelled) setLoading(false)
        return
      }

      if (cached && !cancelled) setUser(cached)

      try {
        let accessToken = token

        // Access token missing/expired → try refresh cookie first
        if (!accessToken) {
          const refreshed = await refreshSession()
          accessToken = refreshed.accessToken
          storeAccessToken(accessToken)
          if (refreshed.user && !cancelled) {
            const nextUser = toPublicUser(refreshed.user)
            writeStoredUser(nextUser)
            setUser(nextUser)
          }
        }

        try {
          const data = await getMe(accessToken)
          if (cancelled) return
          const nextUser = toPublicUser(data.user)
          writeStoredUser(nextUser)
          setUser(nextUser)
        } catch {
          // Access token invalid/expired — rotate via refresh cookie
          const refreshed = await refreshSession()
          if (cancelled) return
          storeAccessToken(refreshed.accessToken)
          const nextUser = toPublicUser(refreshed.user)
          writeStoredUser(nextUser)
          setUser(nextUser)
        }
      } catch {
        if (!cancelled) {
          clearAccessToken()
          writeStoredUser(null)
          setUser(null)
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
