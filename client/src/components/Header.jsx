import { useEffect, useRef, useState } from 'react'
import { Heart, ShoppingBag, Bell, Search, Menu, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import UtilityBar from './UtilityBar'
import MobileMenu from './MobileMenu'
import NotificationsPanel from './NotificationsPanel'
import FavoritesPanel from './FavoritesPanel'
import { useAuth } from '../context/AuthContext'
import { useShopActivity } from '../context/ShopActivityContext'
import { logoutUser } from '../services/authApi'

const CATEGORIES = ['Home & Living', 'Jewelry', 'Art & Prints', 'Vintage', 'Wellness', 'Stationery']

export default function Header({
  activeCategory,
  onSelectCategory,
  onSearch,
  cartCount = 0,
  user = null,
}) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const {
    favorites,
    favoriteCount,
    removeFavorite,
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    clearAllNotifications,
  } = useShopActivity()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const accountRef = useRef(null)
  const notifsRef = useRef(null)
  const favoritesRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setNotifsOpen(false)
      if (favoritesRef.current && !favoritesRef.current.contains(e.target)) setFavoritesOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleSignOut = async () => {
    setAccountOpen(false)
    try {
      await logoutUser()
    } catch {
      // ignore network errors on logout
    }
    logout()
    navigate('/login')
  }

  return (
    <>
      <UtilityBar />

      <header className="sticky top-0 z-30 border-b border-[#D9CFBB] bg-[#FBF8F2]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3 sm:gap-8 sm:px-6">
          <button
            type="button"
            className="sm:hidden cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} className="text-[#2B2620]" />
          </button>

          <Link
            to="/shop"
            className="flex shrink-0 items-center gap-2.5 text-[#2B2620] hover:text-[#5C3A4B] transition-colors"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#5C3A4B] text-[#EEE7D8]">
              <ShoppingBag size={16} />
            </span>
            <span className="font-['Fraunces'] text-2xl italic tracking-tight">Vendora</span>
          </Link>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSearch?.(new FormData(e.target).get('q'))
            }}
            className="hidden min-w-0 flex-1 items-center gap-2 rounded-sm border border-[#D9CFBB] bg-white px-3 py-1.5 sm:flex sm:mx-2"
          >
            <Search size={16} className="shrink-0 text-[#9A9284]" />
            <input
              name="q"
              type="text"
              placeholder="Search products, sellers, categories..."
              className="w-full bg-transparent text-sm text-[#2B2620] outline-none placeholder:text-[#9A9284]"
            />
          </form>

          <div className="flex shrink-0 items-center gap-4 text-[#2B2620] sm:gap-5">
            <div className="relative" ref={notifsRef}>
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notifsOpen}
                onClick={() => {
                  setNotifsOpen((v) => !v)
                  setFavoritesOpen(false)
                  setAccountOpen(false)
                }}
                className="relative hover:text-[#5C3A4B] cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5C3A4B] px-0.5 text-[9px] font-bold text-[#EEE7D8]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationsPanel
                open={notifsOpen}
                onClose={() => setNotifsOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAsUnread={markAsUnread}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAllNotifications}
              />
            </div>

            <div className="relative" ref={favoritesRef}>
              <button
                type="button"
                aria-label="Favourites"
                aria-expanded={favoritesOpen}
                onClick={() => {
                  setFavoritesOpen((v) => !v)
                  setNotifsOpen(false)
                  setAccountOpen(false)
                }}
                className="relative hover:text-[#5C3A4B] cursor-pointer"
              >
                <Heart size={20} fill={favoriteCount > 0 ? 'currentColor' : 'none'} />
                {favoriteCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D6A24A] px-0.5 text-[9px] font-bold text-[#2B2620]">
                    {favoriteCount > 9 ? '9+' : favoriteCount}
                  </span>
                )}
              </button>
              <FavoritesPanel
                open={favoritesOpen}
                onClose={() => setFavoritesOpen(false)}
                favorites={favorites}
                onRemove={removeFavorite}
              />
            </div>

            <button type="button" aria-label="Bag" className="relative hover:text-[#5C3A4B] cursor-pointer">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D6A24A] text-[9px] font-bold text-[#2B2620]">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((v) => !v)
                    setNotifsOpen(false)
                    setFavoritesOpen(false)
                  }}
                  className="flex items-center gap-1.5 hover:text-[#5C3A4B] cursor-pointer"
                >
                  <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6E7856&color=EEE7D8`}
                    alt={user.name}
                    className="h-7 w-7 rounded-full border border-[#D9CFBB] object-cover"
                  />
                  <ChevronDown size={14} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-9 w-48 rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] py-1 shadow-lg">
                    <div className="border-b border-[#D9CFBB] px-4 py-2">
                      <p className="text-sm font-medium text-[#2B2620]">{user.name}</p>
                      {user.email && <p className="text-[11px] text-[#9A9284] truncate">{user.email}</p>}
                    </div>
                    <Link to="/account" className="block px-4 py-2 text-sm text-[#2B2620] hover:bg-[#EEE7D8]" onClick={() => setAccountOpen(false)}>My Account</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-[#2B2620] hover:bg-[#EEE7D8]" onClick={() => setAccountOpen(false)}>My Orders</Link>
                    <button type="button" onClick={handleSignOut} className="block w-full px-4 py-2 text-left text-sm text-[#5C3A4B] hover:bg-[#EEE7D8] cursor-pointer">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="font-mono text-xs uppercase tracking-wide text-[#2B2620] hover:text-[#5C3A4B]">
                  Sign In
                </Link>
                <Link to="/register" className="rounded-sm bg-[#5C3A4B] px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#2B2620]">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        <nav className="mx-auto hidden max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:flex sm:px-6">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(active ? null : cat)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors cursor-pointer ${
                  active
                    ? 'border-[#6E7856] bg-[#6E7856] text-[#EEE7D8]'
                    : 'border-[#D9CFBB] bg-transparent text-[#4A443A] hover:border-[#6E7856] hover:text-[#6E7856]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </nav>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={onSelectCategory}
        user={user}
      />
    </>
  )
}
