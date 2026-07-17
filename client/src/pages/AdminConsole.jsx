import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Eye,
  EyeOff,
  LogOut,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Users,
  Package,
  AlertTriangle,
  Mail,
  Store,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../services/authApi'
import {
  deleteAdminUser,
  deleteModerationProduct,
  fetchAdminAnalytics,
  fetchAdminUsers,
  fetchModerationProducts,
  hideModerationProduct,
  restoreModerationProduct,
  updateAdminUserRole,
} from '../services/adminApi'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');`

const TABS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users', label: 'Users & roles', icon: Users },
  { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function roleBadgeClass(role) {
  if (role === 'admin') return 'bg-[#5C3A4B]/15 text-[#5C3A4B]'
  if (role === 'seller') return 'bg-[#6E7856]/20 text-[#4A5238]'
  return 'bg-[#D6A24A]/20 text-[#7A5A1A]'
}

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#9A9284]">{label}</p>
          <p className="mt-2 font-['Fraunces'] text-3xl text-[#2B2620]">{value}</p>
          {hint && <p className="mt-1 text-xs text-[#6E6455]">{hint}</p>}
        </div>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#2B2620] text-[#EEE7D8]">
            <Icon size={16} />
          </span>
        )}
      </div>
    </div>
  )
}

function CategoryBars({ categories }) {
  const max = Math.max(...categories.map((c) => c.count), 1)
  return (
    <div className="space-y-3">
      {categories.map((item) => (
        <div key={item.category}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-[#4A443A]">{item.category}</span>
            <span className="font-mono text-[#9A9284]">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#EEE7D8]">
            <div
              className="h-full rounded-full bg-[#6E7856] transition-all"
              style={{ width: `${Math.round((item.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
      {!categories.length && <p className="text-sm text-[#9A9284]">No category data yet.</p>}
    </div>
  )
}

export default function AdminConsole() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('analytics')

  const [analytics, setAnalytics] = useState(null)
  const [analyticsError, setAnalyticsError] = useState('')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const [users, setUsers] = useState([])
  const [usersPagination, setUsersPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [userSearch, setUserSearch] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [userActionId, setUserActionId] = useState(null)

  const [products, setProducts] = useState([])
  const [modPagination, setModPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [modSearch, setModSearch] = useState('')
  const [modFilter, setModFilter] = useState('all')
  const [modPage, setModPage] = useState(1)
  const [modLoading, setModLoading] = useState(false)
  const [modError, setModError] = useState('')
  const [modActionId, setModActionId] = useState(null)

  const handleSignOut = async () => {
    try {
      await logoutUser()
    } catch {
      // ignore
    }
    logout()
    navigate('/admin/login')
  }

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    setAnalyticsError('')
    try {
      setAnalytics(await fetchAdminAnalytics())
    } catch (err) {
      setAnalyticsError(err.message || 'Could not load analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError('')
    try {
      const data = await fetchAdminUsers({
        search: userSearch,
        role: userRole,
        page: userPage,
        limit: 12,
      })
      setUsers(data.data || [])
      setUsersPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setUsersError(err.message || 'Could not load users')
    } finally {
      setUsersLoading(false)
    }
  }, [userSearch, userRole, userPage])

  const loadModeration = useCallback(async () => {
    setModLoading(true)
    setModError('')
    try {
      const data = await fetchModerationProducts({
        search: modSearch,
        filter: modFilter,
        page: modPage,
        limit: 12,
      })
      setProducts(data.data || [])
      setModPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setModError(err.message || 'Could not load products')
    } finally {
      setModLoading(false)
    }
  }, [modSearch, modFilter, modPage])

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    if (tab === 'analytics') loadAnalytics()
    if (tab === 'users') loadUsers()
    if (tab === 'moderation') loadModeration()
  }, [user, tab, loadAnalytics, loadUsers, loadModeration])

  const roleBreakdown = useMemo(() => {
    if (!analytics?.users?.byRole) return []
    return Object.entries(analytics.users.byRole).map(([role, count]) => ({ role, count }))
  }, [analytics])

  const handleRoleChange = async (targetUser, nextRole) => {
    if (nextRole === targetUser.role) return
    setUserActionId(targetUser.id)
    setUsersError('')
    try {
      await updateAdminUserRole(targetUser.id, nextRole)
      await loadUsers()
      if (tab === 'analytics') loadAnalytics()
    } catch (err) {
      setUsersError(err.message || 'Could not update role')
    } finally {
      setUserActionId(null)
    }
  }

  const handleDeleteUser = async (targetUser) => {
    const ok = window.confirm(
      `Delete ${targetUser.name} (${targetUser.email})?\n\nThis permanently removes their account and cannot be undone.`,
    )
    if (!ok) return
    setUserActionId(targetUser.id)
    setUsersError('')
    try {
      await deleteAdminUser(targetUser.id)
      await loadUsers()
      if (analytics) loadAnalytics()
    } catch (err) {
      setUsersError(err.message || 'Could not delete user')
    } finally {
      setUserActionId(null)
    }
  }

  const handleHide = async (product) => {
    setModActionId(product.id)
    setModError('')
    try {
      await hideModerationProduct(product.id)
      await loadModeration()
    } catch (err) {
      setModError(err.message || 'Could not hide product')
    } finally {
      setModActionId(null)
    }
  }

  const handleRestore = async (product) => {
    setModActionId(product.id)
    setModError('')
    try {
      await restoreModerationProduct(product.id)
      await loadModeration()
    } catch (err) {
      setModError(err.message || 'Could not restore product')
    } finally {
      setModActionId(null)
    }
  }

  const handleDeleteProduct = async (product) => {
    const ok = window.confirm(`Permanently delete “${product.name}”? This cannot be undone.`)
    if (!ok) return
    setModActionId(product.id)
    setModError('')
    try {
      await deleteModerationProduct(product.id)
      await loadModeration()
    } catch (err) {
      setModError(err.message || 'Could not delete product')
    } finally {
      setModActionId(null)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3EEE1] px-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <div className="max-w-sm text-center">
          <ShieldCheck className="mx-auto text-[#5C3A4B]" size={36} />
          <h1 className="mt-4 font-['Fraunces'] text-2xl text-[#2B2620]">Admin access required</h1>
          <p className="mt-2 text-sm text-[#6E6455]">Sign in with an admin account to open the console.</p>
          <Link
            to="/admin/login"
            className="mt-6 inline-block rounded-sm bg-[#2B2620] px-6 py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B]"
          >
            Admin Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3EEE1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <header className="border-b border-[#D9CFBB] bg-[#FBF8F2]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#5C3A4B] text-[#EEE7D8]">
              <ShoppingBag size={16} />
            </span>
            <div>
              <p className="font-['Fraunces'] text-xl italic text-[#2B2620]">Vendora</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#D6A24A]">Admin Console</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[#2B2620]">{user.name}</p>
              <p className="text-[11px] text-[#9A9284]">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#D9CFBB] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B] hover:bg-[#EEE7D8] cursor-pointer"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="font-['Fraunces'] text-3xl text-[#2B2620] sm:text-4xl">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6E6455]">
            Review marketplace health, manage accounts and roles, and moderate product listings.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-[#D9CFBB] pb-px">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 border-b-2 px-3 py-2.5 font-mono text-[11px] uppercase tracking-wide cursor-pointer ${
                  active
                    ? 'border-[#5C3A4B] text-[#5C3A4B]'
                    : 'border-transparent text-[#6E6455] hover:text-[#2B2620]'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            )
          })}
        </div>

        {tab === 'analytics' && (
          <section className="space-y-6">
            {analyticsError && (
              <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{analyticsError}</p>
            )}
            {analyticsLoading && !analytics ? (
              <p className="text-sm text-[#9A9284]">Loading analytics…</p>
            ) : analytics ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Total users"
                    value={analytics.users.total}
                    hint={`+${analytics.users.last_7_days} this week · +${analytics.users.last_30_days} this month`}
                    icon={Users}
                  />
                  <StatCard
                    label="Products"
                    value={analytics.products.total}
                    hint={`${analytics.products.ai_picks} AI picks · ${analytics.products.hidden} hidden`}
                    icon={Package}
                  />
                  <StatCard
                    label="Sellers"
                    value={analytics.sellers}
                    hint={`Avg price $${Number(analytics.products.avg_price || 0).toFixed(2)}`}
                    icon={Store}
                  />
                  <StatCard
                    label="Newsletter"
                    value={analytics.newsletter.total}
                    hint={`${analytics.newsletter.opted_in} opted in · ${analytics.newsletter.pending} pending`}
                    icon={Mail}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#9A9284]">Users by role</p>
                    <h2 className="mt-1 font-['Fraunces'] text-xl text-[#2B2620]">Role mix</h2>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {roleBreakdown.map(({ role, count }) => (
                        <div key={role} className="rounded-sm border border-[#E7DFD0] bg-white px-3 py-3 text-center">
                          <p className={`mx-auto inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${roleBadgeClass(role)}`}>
                            {role}
                          </p>
                          <p className="mt-2 font-['Fraunces'] text-2xl text-[#2B2620]">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#9A9284]">Catalog</p>
                    <h2 className="mt-1 font-['Fraunces'] text-xl text-[#2B2620]">Products by category</h2>
                    <div className="mt-5">
                      <CategoryBars categories={analytics.categories || []} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] p-5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-[#D6A24A]" />
                      <h2 className="font-['Fraunces'] text-xl text-[#2B2620]">Low stock</h2>
                    </div>
                    <p className="mt-1 text-xs text-[#6E6455]">
                      {analytics.products.low_stock} products at or below 5 units
                    </p>
                    <ul className="mt-4 divide-y divide-[#E7DFD0]">
                      {(analytics.lowStock || []).map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#2B2620]">{item.name}</p>
                            <p className="text-xs text-[#9A9284]">{item.seller}</p>
                          </div>
                          <span className="shrink-0 font-mono text-xs text-[#5C3A4B]">{item.stock} left</span>
                        </li>
                      ))}
                      {!analytics.lowStock?.length && (
                        <li className="py-3 text-sm text-[#9A9284]">No low-stock items right now.</li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] p-5">
                    <h2 className="font-['Fraunces'] text-xl text-[#2B2620]">Recent signups</h2>
                    <ul className="mt-4 divide-y divide-[#E7DFD0]">
                      {(analytics.recentUsers || []).map((u) => (
                        <li key={u.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#2B2620]">{u.name}</p>
                            <p className="truncate text-xs text-[#9A9284]">{u.email}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${roleBadgeClass(u.role)}`}>
                              {u.role}
                            </span>
                            <p className="mt-1 text-[11px] text-[#9A9284]">{formatDate(u.createdAt)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        )}

        {tab === 'users' && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-['Fraunces'] text-2xl text-[#2B2620]">Users & roles</h2>
                <p className="mt-1 text-sm text-[#6E6455]">
                  Search accounts, change roles, or permanently delete a user.
                </p>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#9A9284]">
                {usersPagination.total} users
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9284]" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => {
                    setUserPage(1)
                    setUserSearch(e.target.value)
                  }}
                  placeholder="Search name or email…"
                  className="w-full rounded-sm border border-[#D9CFBB] bg-white py-2.5 pl-9 pr-3 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                />
              </div>
              <select
                value={userRole}
                onChange={(e) => {
                  setUserPage(1)
                  setUserRole(e.target.value)
                }}
                className="rounded-sm border border-[#D9CFBB] bg-white px-3 py-2.5 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B] cursor-pointer"
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>

            {usersError && (
              <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{usersError}</p>
            )}

            <div className="overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[#D9CFBB] bg-[#2B2620] text-[#EEE7D8]">
                    <tr className="font-mono text-[10px] uppercase tracking-widest">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading && !users.length ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-[#9A9284]">Loading users…</td>
                      </tr>
                    ) : users.length ? (
                      users.map((u) => {
                        const isSelf = u.id === user.id
                        const busy = userActionId === u.id
                        return (
                          <tr key={u.id} className="border-b border-[#E7DFD0] last:border-0">
                            <td className="px-4 py-3">
                              <p className="font-medium text-[#2B2620]">
                                {u.name}
                                {isSelf && (
                                  <span className="ml-2 font-mono text-[10px] uppercase text-[#D6A24A]">You</span>
                                )}
                              </p>
                              <p className="text-xs text-[#9A9284]">{u.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={u.role}
                                disabled={busy}
                                onChange={(e) => handleRoleChange(u, e.target.value)}
                                className={`rounded-full border-0 px-2.5 py-1 font-mono text-[10px] uppercase outline-none cursor-pointer disabled:opacity-50 ${roleBadgeClass(u.role)}`}
                              >
                                <option value="buyer">Buyer</option>
                                <option value="seller">Seller</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-[#6E6455]">{formatDate(u.createdAt)}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                disabled={busy || isSelf}
                                onClick={() => handleDeleteUser(u)}
                                className="inline-flex items-center gap-1.5 rounded-sm border border-[#D9CFBB] bg-white px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-[#5C3A4B] hover:border-[#5C3A4B] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                                title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-[#9A9284]">No users match your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination
              page={usersPagination.page}
              totalPages={usersPagination.totalPages}
              onPrev={() => setUserPage((p) => Math.max(1, p - 1))}
              onNext={() => setUserPage((p) => Math.min(usersPagination.totalPages, p + 1))}
            />
          </section>
        )}

        {tab === 'moderation' && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-['Fraunces'] text-2xl text-[#2B2620]">Moderation</h2>
                <p className="mt-1 text-sm text-[#6E6455]">
                  Hide listings from the shop, restore them, or delete products permanently.
                </p>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#9A9284]">
                {modPagination.total} listings
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9284]" />
                <input
                  type="search"
                  value={modSearch}
                  onChange={(e) => {
                    setModPage(1)
                    setModSearch(e.target.value)
                  }}
                  placeholder="Search product or seller…"
                  className="w-full rounded-sm border border-[#D9CFBB] bg-white py-2.5 pl-9 pr-3 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                />
              </div>
              <select
                value={modFilter}
                onChange={(e) => {
                  setModPage(1)
                  setModFilter(e.target.value)
                }}
                className="rounded-sm border border-[#D9CFBB] bg-white px-3 py-2.5 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B] cursor-pointer"
              >
                <option value="all">All products</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="low_stock">Low stock</option>
              </select>
            </div>

            {modError && (
              <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{modError}</p>
            )}

            <div className="space-y-3">
              {modLoading && !products.length ? (
                <p className="text-sm text-[#9A9284]">Loading products…</p>
              ) : products.length ? (
                products.map((product) => {
                  const busy = modActionId === product.id
                  return (
                    <div
                      key={product.id}
                      className="flex flex-col gap-4 rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-[#E7DFD0] bg-[#EEE7D8]">
                          {product.image ? (
                            <img src={product.image} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium text-[#2B2620]">{product.name}</p>
                            {product.isHidden && (
                              <span className="rounded-full bg-[#5C3A4B]/15 px-2 py-0.5 font-mono text-[10px] uppercase text-[#5C3A4B]">
                                Hidden
                              </span>
                            )}
                            {product.stock <= 5 && !product.isHidden && (
                              <span className="rounded-full bg-[#D6A24A]/20 px-2 py-0.5 font-mono text-[10px] uppercase text-[#7A5A1A]">
                                Low stock
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-[#9A9284]">
                            {product.seller} · {product.category} · ${Number(product.price).toFixed(2)} · {product.stock} in stock
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        {product.isHidden ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleRestore(product)}
                            className="inline-flex items-center gap-1.5 rounded-sm bg-[#6E7856] px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5A6348] disabled:opacity-50 cursor-pointer"
                          >
                            <Eye size={12} /> Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleHide(product)}
                            className="inline-flex items-center gap-1.5 rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#2B2620] hover:border-[#5C3A4B] disabled:opacity-50 cursor-pointer"
                          >
                            <EyeOff size={12} /> Hide
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDeleteProduct(product)}
                          className="inline-flex items-center gap-1.5 rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#5C3A4B] hover:border-[#5C3A4B] disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] px-4 py-8 text-center text-sm text-[#9A9284]">
                  No products match your filters.
                </p>
              )}
            </div>

            <Pagination
              page={modPagination.page}
              totalPages={modPagination.totalPages}
              onPrev={() => setModPage((p) => Math.max(1, p - 1))}
              onNext={() => setModPage((p) => Math.min(modPagination.totalPages, p + 1))}
            />
          </section>
        )}
      </main>
    </div>
  )
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between pt-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1}
        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B] disabled:opacity-40 cursor-pointer"
      >
        <ChevronLeft size={14} /> Prev
      </button>
      <p className="font-mono text-[11px] text-[#9A9284]">
        Page {page} of {totalPages}
      </p>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B] disabled:opacity-40 cursor-pointer"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  )
}
