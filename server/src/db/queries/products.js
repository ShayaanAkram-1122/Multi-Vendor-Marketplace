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
      image,
      discount_percent::float AS "discountPercent"
    FROM products
    WHERE is_hidden = FALSE
      AND ($1::text IS NULL OR category::text = $1)
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
    WHERE is_hidden = FALSE
      AND ($1::text IS NULL OR category::text = $1)
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
      image,
      discount_percent::float AS "discountPercent"
    FROM products
    WHERE ai_pick = TRUE
      AND is_hidden = FALSE
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

async function nextProductId() {
  const { rows } = await query(`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM products`)
  return rows[0].next_id
}

async function createProduct(input) {
  const id = input.id || (await nextProductId())
  const { rows } = await query(
    `
    INSERT INTO products (
      id, name, seller_id, seller_name, price, rating, category,
      ai_pick, tilt, description, stock, image, discount_percent
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING
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
      image,
      discount_percent::float AS "discountPercent"
    `,
    [
      id,
      input.name,
      input.sellerId,
      input.sellerName || input.seller,
      input.price,
      input.rating ?? 5,
      input.category,
      Boolean(input.aiPick),
      input.tilt || 'rotate-1',
      input.description || '',
      input.stock ?? 0,
      input.image || '',
      input.discountPercent ?? 0,
    ],
  )
  return rows[0]
}

async function updateProductDiscount(productId, discountPercent) {
  const { rows } = await query(
    `
    UPDATE products
    SET discount_percent = $2,
        updated_at = NOW()
    WHERE id = $1
    RETURNING
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
      image,
      discount_percent::float AS "discountPercent"
    `,
    [productId, discountPercent],
  )
  return rows[0] || null
}

module.exports = {
  listProducts,
  listAiPicks,
  listByCategory,
  createProduct,
  updateProductDiscount,
}
