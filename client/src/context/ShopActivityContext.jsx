import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'

const ShopActivityContext = createContext(null)

function storageKey(userId, suffix) {
  return `vendora_${suffix}_${userId || 'guest'}`
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ShopActivityProvider({ children }) {
  const { user } = useAuth()
  const userKey = user?.id || 'guest'

  const [favorites, setFavorites] = useState([])
  const [notifications, setNotifications] = useState([])
  const [ready, setReady] = useState(false)

  // Load per-user (or guest) state when auth identity changes
  useEffect(() => {
    setFavorites(readJson(storageKey(userKey, 'favorites'), []))
    setNotifications(readJson(storageKey(userKey, 'notifications'), []))
    setReady(true)
  }, [userKey])

  useEffect(() => {
    if (!ready) return
    writeJson(storageKey(userKey, 'favorites'), favorites)
  }, [favorites, userKey, ready])

  useEffect(() => {
    if (!ready) return
    writeJson(storageKey(userKey, 'notifications'), notifications)
  }, [notifications, userKey, ready])

  const isFavorite = useCallback(
    (productId) => favorites.some((f) => String(f.id) === String(productId)),
    [favorites],
  )

  const pushNotification = useCallback((partial) => {
    const note = {
      id: makeId(),
      type: partial.type || 'info',
      title: partial.title,
      body: partial.body || '',
      productId: partial.productId || null,
      image: partial.image || null,
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [note, ...prev].slice(0, 50))
    return note
  }, [])

  const toggleFavorite = useCallback((product) => {
    if (!product?.id) return { added: false }

    const exists = favorites.some((f) => String(f.id) === String(product.id))
    if (exists) {
      setFavorites((prev) => prev.filter((f) => String(f.id) !== String(product.id)))
      return { added: false }
    }

    setFavorites((prev) => [
      {
        id: product.id,
        name: product.name,
        seller: product.seller,
        price: product.price,
        image: product.image || null,
        rating: product.rating,
      },
      ...prev.filter((f) => String(f.id) !== String(product.id)),
    ])

    pushNotification({
      type: 'favorite',
      title: 'Added to favourites',
      body: `${product.name} was saved to your favourites.`,
      productId: product.id,
      image: product.image || null,
    })

    return { added: true }
  }, [favorites, pushNotification])

  const removeFavorite = useCallback((productId) => {
    setFavorites((prev) => prev.filter((f) => String(f.id) !== String(productId)))
  }, [])

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const markAsUnread = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const value = useMemo(
    () => ({
      favorites,
      favoriteCount: favorites.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      notifications,
      unreadCount,
      pushNotification,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      clearAllNotifications,
    }),
    [
      favorites,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      notifications,
      unreadCount,
      pushNotification,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      clearAllNotifications,
    ],
  )

  return (
    <ShopActivityContext.Provider value={value}>
      {children}
    </ShopActivityContext.Provider>
  )
}

export function useShopActivity() {
  const ctx = useContext(ShopActivityContext)
  if (!ctx) {
    throw new Error('useShopActivity must be used within ShopActivityProvider')
  }
  return ctx
}
