const { query } = require('../../config/db')

const LIST_PRODUCTS = `
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
  ORDER BY id ASC
  LIMIT $3
`

const COUNT_PRODUCTS = `
  SELECT COUNT(*)::int AS total
  FROM products
  WHERE ($1::text IS NULL OR category::text = $1)
    AND (
      $2::text IS NULL
      OR name ILIKE '%' || $2 || '%'
      OR seller_name ILIKE '%' || $2 || '%'
    )
`

const LIST_AI_PICKS = `
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
  ORDER BY id ASC
  LIMIT $1
`

async function listProducts({ category = null, search = null, limit = 100 } = {}) {
  const cat = category && category !== 'All' ? category : null
  const q = search && search.trim() ? search.trim() : null
  const { rows } = await query(LIST_PRODUCTS, [cat, q, limit])
  return rows
}

async function countProducts({ category = null, search = null } = {}) {
  const cat = category && category !== 'All' ? category : null
  const q = search && search.trim() ? search.trim() : null
  const { rows } = await query(COUNT_PRODUCTS, [cat, q])
  return rows[0].total
}

async function listAiPicks(limit = 8) {
  const { rows } = await query(LIST_AI_PICKS, [limit])
  return rows
}

module.exports = {
  listProducts,
  countProducts,
  listAiPicks,
}
