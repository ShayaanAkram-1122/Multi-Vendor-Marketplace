import axios from 'axios'
import { PRODUCTS } from '../data/catalog'

const USE_LIVE_API = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

export async function fetchProducts({ page = 1, limit = 12, category, search, sort } = {}) {
  if (!USE_LIVE_API) {
    return localFallback({ page, limit, category, search, sort })
  }
  try {
    const { data } = await api.get('/products', {
      params: { page, limit, category: category || undefined, search: search || undefined, sort },
    })
    return {
      data: data.data || data.products || [],
      pagination: data.pagination || {
        page,
        limit,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / limit) || 1,
      },
    }
  } catch (err) {
    console.warn('Live API unavailable, falling back to seed data:', err.message)
    return localFallback({ page, limit, category, search, sort })
  }
}

function localFallback({ page, limit, category, search, sort }) {
  let items = [...PRODUCTS]
  if (category) items = items.filter((p) => p.category === category)
  if (search) {
    const q = String(search).toLowerCase()
    items = items.filter(
      (p) => p.name.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q),
    )
  }
  if (sort === 'price_asc') items.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') items.sort((a, b) => b.price - a.price)
  if (sort === 'newest') items.sort((a, b) => b.id - a.id)

  const total = items.length
  const start = (page - 1) * limit
  const paged = items.slice(start, start + limit)

  return {
    data: paged,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  }
}

export async function getAiPicks(limit = 10) {
  if (!USE_LIVE_API) {
    return PRODUCTS.filter((p) => p.aiPick).slice(0, limit)
  }
  try {
    const { data } = await api.get('/products/ai-picks', { params: { limit } })
    return data.products || data.data || []
  } catch {
    return PRODUCTS.filter((p) => p.aiPick).slice(0, limit)
  }
}

export async function getByCategory(category, limit = 10) {
  if (!USE_LIVE_API) {
    return PRODUCTS.filter((p) => p.category === category).slice(0, limit)
  }
  try {
    const { data } = await api.get('/products', {
      params: { category, limit, page: 1, sort: 'newest' },
    })
    return data.data || data.products || []
  } catch {
    return PRODUCTS.filter((p) => p.category === category).slice(0, limit)
  }
}
