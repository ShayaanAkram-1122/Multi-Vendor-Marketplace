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

function toCartItem(product, quantity = 1) {
  const discount = Number(product.discountPercent || product.discount_percent || 0)
  const price = Number(product.price) || 0
  return {
    id: product.id,
    name: product.name,
    seller: product.seller,
    price,
    discountPercent: discount,
    image: product.image || null,
    quantity: Math.max(1, quantity),
  }
}

function lineTotal(item) {
  const discount = Number(item.discountPercent) || 0
  const unit = discount > 0 ? item.price * (1 - discount / 100) : item.price
  return unit * item.quantity
}

export function ShopActivityProvider({ children }) {
  const { user } = useAuth()
  const userKey = user?.id || 'guest'

  const [favorites, setFavorites] = useState([])
  const [notifications, setNotifications] = useState([])
  const [cart, setCart] = useState([])
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [toasts, setToasts] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setFavorites(readJson(storageKey(userKey, 'favorites'), []))
    setNotifications(readJson(storageKey(userKey, 'notifications'), []))
    setCart(readJson(storageKey(userKey, 'cart'), []))
    setDeliveryLocation(readJson(storageKey(userKey, 'delivery_location'), null))
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

  useEffect(() => {
    if (!ready) return
    writeJson(storageKey(userKey, 'cart'), cart)
  }, [cart, userKey, ready])

  useEffect(() => {
    if (!ready) return
    writeJson(storageKey(userKey, 'delivery_location'), deliveryLocation)
  }, [deliveryLocation, userKey, ready])

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

  const showToast = useCallback((partial) => {
    const toast = {
      id: makeId(),
      type: partial.type || 'success',
      title: partial.title,
      body: partial.body || '',
      duration: partial.duration ?? 3200,
    }
    setToasts((prev) => [...prev, toast].slice(-4))
    return toast
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toggleFavorite = useCallback((product) => {
    if (!product?.id) return { added: false }

    const exists = favorites.some((f) => String(f.id) === String(product.id))
    if (exists) {
      setFavorites((prev) => prev.filter((f) => String(f.id) !== String(product.id)))
      showToast({
        type: 'favorite',
        title: 'Removed from favourites',
        body: `${product.name} was removed from your favourites.`,
      })
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

    showToast({
      type: 'favorite',
      title: 'Item added successfully to favourites',
      body: product.name,
    })

    return { added: true }
  }, [favorites, pushNotification, showToast])

  const removeFavorite = useCallback((productId) => {
    setFavorites((prev) => prev.filter((f) => String(f.id) !== String(productId)))
  }, [])

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?.id) return

    setCart((prev) => {
      const existing = prev.find((item) => String(item.id) === String(product.id))
      if (existing) {
        return prev.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + Math.max(1, quantity) }
            : item,
        )
      }
      return [...prev, toCartItem(product, quantity)]
    })

    pushNotification({
      type: 'cart',
      title: 'Added to bag',
      body: `${product.name} was added to your shopping bag.`,
      productId: product.id,
      image: product.image || null,
    })

    showToast({
      type: 'cart',
      title: 'Item added successfully to cart',
      body: product.name,
    })
  }, [pushNotification, showToast])

  const updateCartQuantity = useCallback((productId, quantity) => {
    const nextQty = Math.max(0, Number(quantity) || 0)
    setCart((prev) => {
      if (nextQty <= 0) {
        return prev.filter((item) => String(item.id) !== String(productId))
      }
      return prev.map((item) =>
        String(item.id) === String(productId) ? { ...item, quantity: nextQty } : item,
      )
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => String(item.id) !== String(productId)))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
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

  const saveDeliveryLocation = useCallback((location) => {
    if (!location) {
      setDeliveryLocation(null)
      return null
    }
    const next = {
      label: String(location.label || '').trim(),
      address: String(location.address || '').trim(),
      city: String(location.city || '').trim(),
      region: String(location.region || '').trim(),
      country: String(location.country || '').trim(),
      postalCode: String(location.postalCode || '').trim(),
      lat: location.lat == null || location.lat === '' ? null : Number(location.lat),
      lng: location.lng == null || location.lng === '' ? null : Number(location.lng),
      source: location.source || 'manual',
      updatedAt: new Date().toISOString(),
    }
    setDeliveryLocation(next)
    pushNotification({
      type: 'info',
      title: 'Delivery location saved',
      body: next.label || [next.city, next.country].filter(Boolean).join(', ') || 'Your delivery address was updated.',
    })
    return next
  }, [pushNotification])

  const clearDeliveryLocation = useCallback(() => {
    setDeliveryLocation(null)
  }, [])

  const deliveryLabel = useMemo(() => {
    if (!deliveryLocation) return 'Set delivery location'
    if (deliveryLocation.label) return deliveryLocation.label
    const parts = [deliveryLocation.city, deliveryLocation.country].filter(Boolean)
    if (parts.length) return parts.join(', ')
    if (deliveryLocation.address) return deliveryLocation.address
    return 'Set delivery location'
  }, [deliveryLocation])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + lineTotal(item), 0),
    [cart],
  )

  const value = useMemo(
    () => ({
      ready,
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
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      lineTotal,
      deliveryLocation,
      deliveryLabel,
      saveDeliveryLocation,
      clearDeliveryLocation,
      toasts,
      showToast,
      dismissToast,
    }),
    [
      ready,
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
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      deliveryLocation,
      deliveryLabel,
      saveDeliveryLocation,
      clearDeliveryLocation,
      toasts,
      showToast,
      dismissToast,
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
