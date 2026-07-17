import { getAccessToken } from './authApi'

const API_URL = import.meta.env.VITE_API_URL || '/api'

async function adminRequest(path, options = {}) {
  const token = getAccessToken()
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

export function fetchAdminAnalytics() {
  return adminRequest('/admin/analytics')
}

export function fetchAdminUsers({ search = '', role = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (role) params.set('role', role)
  params.set('page', String(page))
  params.set('limit', String(limit))
  return adminRequest(`/admin/users?${params}`)
}

export function updateAdminUserRole(userId, role) {
  return adminRequest(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

export function deleteAdminUser(userId) {
  return adminRequest(`/admin/users/${userId}`, { method: 'DELETE' })
}

export function fetchModerationProducts({ search = '', filter = 'all', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (filter) params.set('filter', filter)
  params.set('page', String(page))
  params.set('limit', String(limit))
  return adminRequest(`/admin/moderation/products?${params}`)
}

export function hideModerationProduct(productId) {
  return adminRequest(`/admin/moderation/products/${productId}/hide`, { method: 'POST' })
}

export function restoreModerationProduct(productId) {
  return adminRequest(`/admin/moderation/products/${productId}/restore`, { method: 'POST' })
}

export function deleteModerationProduct(productId) {
  return adminRequest(`/admin/moderation/products/${productId}`, { method: 'DELETE' })
}
