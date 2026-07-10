const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path) {
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load products')
  }
  return data
}

export function fetchProducts({ category, search, limit = 100 } = {}) {
  const params = new URLSearchParams()
  if (category && category !== 'All') params.set('category', category)
  if (search?.trim()) params.set('search', search.trim())
  params.set('limit', String(limit))
  const qs = params.toString()
  return request(`/products?${qs}`)
}

export function fetchAiPicks(limit = 8) {
  return request(`/products/ai-picks?limit=${limit}`)
}
