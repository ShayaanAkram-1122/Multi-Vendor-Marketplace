import { getAccessToken } from './authApi'

const API_URL = import.meta.env.VITE_API_URL || '/api'

async function authedRequest(path, options = {}) {
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

export function fetchMyRoleRequest() {
  return authedRequest('/role-requests/me')
}

export function submitRoleRequest(message = '') {
  return authedRequest('/role-requests', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export function fetchAdminRoleRequests() {
  return authedRequest('/admin/role-requests')
}

export function approveRoleRequest(id) {
  return authedRequest(`/admin/role-requests/${id}/approve`, { method: 'POST' })
}

export function rejectRoleRequest(id) {
  return authedRequest(`/admin/role-requests/${id}/reject`, { method: 'POST' })
}
