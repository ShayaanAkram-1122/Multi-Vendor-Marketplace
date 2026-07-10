const { query } = require('../../config/db')

const SORT_SQL = {
  newest: 'id DESC',
  price_asc: 'price ASC',
  price_desc: 'price DESC',
  rating: 'rating DESC',
}

function normalizeCategory(category) {
  if (!category || category === 'All') return null
  return category
}

async function listProducts({
  category = null,
  search = null,
  sort = 'newest',
  page = 1,
  limit = 12,
} = {}) {
  const cat = normalizeCategory(category)
  const q = search && String(search).trim() ? String(search).trim() : null
  const orderBy = SORT_SQL[sort] || SORT_SQL.newest
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 300)
  const safePage = Math.max(Number(page) || 1, 1)
  const offset = (safePage - 1) * safeLimit

  const listSql = `
    SELECT
      id,
      name,
      seller_name AS seller,
      price::float AS price,
      rating::float AS rating,
      category,
      ai_pick AS "aiPick",
      tilt,
      description,
      stock,
      image
    FROM products
    WHERE ($1::text IS NULL OR category::text = $1)
      AND (
        $2::text IS NULL
        OR name ILIKE '%' || $2 || '%'
        OR seller_name ILIKE '%' || $2 || '%'
      )
    ORDER BY ${orderBy}
    LIMIT $3 OFFSET $4
  `

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM products
    WHERE ($1::text IS NULL OR category::text = $1)
      AND (
        $2::text IS NULL
        OR name ILIKE '%' || $2 || '%'
        OR seller_name ILIKE '%' || $2 || '%'
      )
  `

  const [listResult, countResult] = await Promise.all([
    query(listSql, [cat, q, safeLimit, offset]),
    query(countSql, [cat, q]),
  ])

  const total = countResult.rows[0].total
  return {
    data: listResult.rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  }
}

async function listAiPicks(limit = 8) {
  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 50)
  const { rows } = await query(
    `
    SELECT
      id,
      name,
      seller_name AS seller,
      price::float AS price,
      rating::float AS rating,
      category,
      ai_pick AS "aiPick",
      tilt,
      description,
      stock,
      image
    FROM products
    WHERE ai_pick = TRUE
    ORDER BY rating DESC, id ASC
    LIMIT $1
    `,
    [safeLimit],
  )
  return rows
}

async function listByCategory(category, limit = 10) {
  const result = await listProducts({
    category,
    limit,
    page: 1,
    sort: 'newest',
  })
  return result.data
}

module.exports = {
  listProducts,
  listAiPicks,
  listByCategory,
}
