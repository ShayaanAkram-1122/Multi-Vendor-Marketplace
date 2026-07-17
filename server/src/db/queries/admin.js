const { query } = require('../../config/db')

async function getAnalytics() {
  const [
    users,
    roles,
    products,
    categories,
    sellers,
    newsletter,
    recentUsers,
    lowStock,
    revenue,
    categoryRevenue,
    topSellers,
    priceBands,
  ] = await Promise.all([
      query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS last_7_days,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last_30_days
        FROM users
      `),
      query(`
        SELECT role::text AS role, COUNT(*)::int AS count
        FROM users
        GROUP BY role
        ORDER BY role
      `),
      query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE ai_pick = TRUE)::int AS ai_picks,
          COUNT(*) FILTER (WHERE is_hidden = TRUE)::int AS hidden,
          COUNT(*) FILTER (WHERE is_hidden = FALSE)::int AS visible,
          COUNT(*) FILTER (WHERE stock <= 5 AND is_hidden = FALSE)::int AS low_stock,
          COUNT(*) FILTER (WHERE stock = 0 AND is_hidden = FALSE)::int AS out_of_stock,
          COUNT(*) FILTER (WHERE discount_percent > 0 AND is_hidden = FALSE)::int AS on_sale,
          COALESCE(ROUND(AVG(price) FILTER (WHERE is_hidden = FALSE)::numeric, 2), 0)::float AS avg_price,
          COALESCE(ROUND(AVG(rating) FILTER (WHERE is_hidden = FALSE)::numeric, 2), 0)::float AS avg_rating,
          COALESCE(SUM(stock) FILTER (WHERE is_hidden = FALSE), 0)::int AS total_units
        FROM products
      `),
      query(`
        SELECT category::text AS category, COUNT(*)::int AS count
        FROM products
        WHERE is_hidden = FALSE
        GROUP BY category
        ORDER BY count DESC
      `),
      query(`SELECT COUNT(*)::int AS total FROM sellers`),
      query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE marketing_opt_in = TRUE)::int AS opted_in,
          COUNT(*) FILTER (WHERE marketing_opt_in = FALSE)::int AS opted_out,
          COUNT(*) FILTER (WHERE marketing_opt_in IS NULL)::int AS pending
        FROM newsletter_subscribers
      `),
      query(`
        SELECT id, name, email, role::text AS role, created_at AS "createdAt"
        FROM users
        ORDER BY created_at DESC
        LIMIT 8
      `),
      query(`
        SELECT
          id,
          name,
          seller_name AS seller,
          stock,
          price::float AS price,
          category::text AS category
        FROM products
        WHERE is_hidden = FALSE AND stock <= 5
        ORDER BY stock ASC, id ASC
        LIMIT 10
      `),
      query(`
        SELECT
          COALESCE(ROUND(SUM(
            price * (1 - COALESCE(discount_percent, 0) / 100.0) * stock
          ) FILTER (WHERE is_hidden = FALSE)::numeric, 2), 0)::float AS inventory_value,
          COALESCE(ROUND(SUM(
            price * stock
          ) FILTER (WHERE is_hidden = FALSE)::numeric, 2), 0)::float AS list_inventory_value,
          COALESCE(ROUND(SUM(
            price * (COALESCE(discount_percent, 0) / 100.0) * stock
          ) FILTER (WHERE is_hidden = FALSE AND discount_percent > 0)::numeric, 2), 0)::float AS discount_savings,
          COALESCE(ROUND(AVG(
            price * (1 - COALESCE(discount_percent, 0) / 100.0)
          ) FILTER (WHERE is_hidden = FALSE)::numeric, 2), 0)::float AS avg_sale_price,
          COALESCE(ROUND(MAX(price) FILTER (WHERE is_hidden = FALSE)::numeric, 2), 0)::float AS max_price,
          COALESCE(ROUND(MIN(price) FILTER (WHERE is_hidden = FALSE)::numeric, 2), 0)::float AS min_price
        FROM products
      `),
      query(`
        SELECT
          category::text AS category,
          COUNT(*)::int AS products,
          COALESCE(SUM(stock), 0)::int AS units,
          COALESCE(ROUND(SUM(
            price * (1 - COALESCE(discount_percent, 0) / 100.0) * stock
          )::numeric, 2), 0)::float AS revenue
        FROM products
        WHERE is_hidden = FALSE
        GROUP BY category
        ORDER BY revenue DESC
      `),
      query(`
        SELECT
          seller_name AS seller,
          COUNT(*)::int AS products,
          COALESCE(SUM(stock), 0)::int AS units,
          COALESCE(ROUND(SUM(
            price * (1 - COALESCE(discount_percent, 0) / 100.0) * stock
          )::numeric, 2), 0)::float AS revenue,
          COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::float AS rating
        FROM products
        WHERE is_hidden = FALSE
        GROUP BY seller_name
        ORDER BY revenue DESC
        LIMIT 6
      `),
      query(`
        SELECT band, COUNT(*)::int AS count
        FROM (
          SELECT
            CASE
              WHEN price < 25 THEN 'Under $25'
              WHEN price < 50 THEN '$25–$50'
              WHEN price < 100 THEN '$50–$100'
              WHEN price < 200 THEN '$100–$200'
              ELSE '$200+'
            END AS band,
            CASE
              WHEN price < 25 THEN 1
              WHEN price < 50 THEN 2
              WHEN price < 100 THEN 3
              WHEN price < 200 THEN 4
              ELSE 5
            END AS sort_key
          FROM products
          WHERE is_hidden = FALSE
        ) bands
        GROUP BY band, sort_key
        ORDER BY sort_key
      `),
    ])

  const roleMap = { admin: 0, seller: 0, buyer: 0 }
  for (const row of roles.rows) {
    roleMap[row.role] = row.count
  }

  const rev = revenue.rows[0] || {}
  const listValue = Number(rev.list_inventory_value || 0)
  const inventoryValue = Number(rev.inventory_value || 0)

  return {
    users: {
      ...users.rows[0],
      byRole: roleMap,
    },
    products: products.rows[0],
    categories: categories.rows,
    sellers: sellers.rows[0].total,
    newsletter: newsletter.rows[0],
    recentUsers: recentUsers.rows,
    lowStock: lowStock.rows,
    revenue: {
      inventoryValue,
      listInventoryValue: listValue,
      discountSavings: Number(rev.discount_savings || 0),
      avgSalePrice: Number(rev.avg_sale_price || 0),
      maxPrice: Number(rev.max_price || 0),
      minPrice: Number(rev.min_price || 0),
      discountRate: listValue > 0
        ? Math.round(((listValue - inventoryValue) / listValue) * 1000) / 10
        : 0,
    },
    categoryRevenue: categoryRevenue.rows,
    topSellers: topSellers.rows,
    priceBands: priceBands.rows,
  }
}

async function listUsers({ search = null, role = null, page = 1, limit = 20 } = {}) {
  const q = search && String(search).trim() ? String(search).trim() : null
  const roleFilter = role && ['admin', 'seller', 'buyer'].includes(role) ? role : null
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const safePage = Math.max(Number(page) || 1, 1)
  const offset = (safePage - 1) * safeLimit

  const listSql = `
    SELECT id, name, email, role::text AS role, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM users
    WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
      AND ($2::text IS NULL OR role::text = $2)
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4
  `

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM users
    WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
      AND ($2::text IS NULL OR role::text = $2)
  `

  const [listResult, countResult] = await Promise.all([
    query(listSql, [q, roleFilter, safeLimit, offset]),
    query(countSql, [q, roleFilter]),
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

async function updateUserRole(userId, role) {
  const { rows } = await query(
    `
    UPDATE users
    SET role = $2
    WHERE id = $1
    RETURNING id, name, email, role::text AS role, created_at AS "createdAt"
    `,
    [userId, role],
  )
  return rows[0] || null
}

async function countAdmins() {
  const { rows } = await query(`SELECT COUNT(*)::int AS total FROM users WHERE role = 'admin'`)
  return rows[0].total
}

async function deleteUser(userId) {
  const { rows } = await query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, name, email, role::text AS role
    `,
    [userId],
  )
  return rows[0] || null
}

async function findUserById(userId) {
  const { rows } = await query(
    `
    SELECT id, name, email, role::text AS role, created_at AS "createdAt"
    FROM users
    WHERE id = $1
    `,
    [userId],
  )
  return rows[0] || null
}

async function listModerationProducts({
  search = null,
  filter = 'all',
  page = 1,
  limit = 20,
} = {}) {
  const q = search && String(search).trim() ? String(search).trim() : null
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const safePage = Math.max(Number(page) || 1, 1)
  const offset = (safePage - 1) * safeLimit

  let filterSql = ''
  if (filter === 'hidden') filterSql = 'AND is_hidden = TRUE'
  else if (filter === 'visible') filterSql = 'AND is_hidden = FALSE'
  else if (filter === 'low_stock') filterSql = 'AND is_hidden = FALSE AND stock <= 5'

  const listSql = `
    SELECT
      id,
      name,
      seller_name AS seller,
      price::float AS price,
      rating::float AS rating,
      category::text AS category,
      stock,
      image,
      is_hidden AS "isHidden",
      moderated_at AS "moderatedAt",
      created_at AS "createdAt"
    FROM products
    WHERE (
      $1::text IS NULL
      OR name ILIKE '%' || $1 || '%'
      OR seller_name ILIKE '%' || $1 || '%'
    )
    ${filterSql}
    ORDER BY is_hidden DESC, updated_at DESC, id DESC
    LIMIT $2 OFFSET $3
  `

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM products
    WHERE (
      $1::text IS NULL
      OR name ILIKE '%' || $1 || '%'
      OR seller_name ILIKE '%' || $1 || '%'
    )
    ${filterSql}
  `

  const [listResult, countResult] = await Promise.all([
    query(listSql, [q, safeLimit, offset]),
    query(countSql, [q]),
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

async function setProductHidden(productId, isHidden) {
  const { rows } = await query(
    `
    UPDATE products
    SET is_hidden = $2,
        moderated_at = CASE WHEN $2 THEN NOW() ELSE moderated_at END,
        updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      name,
      seller_name AS seller,
      price::float AS price,
      rating::float AS rating,
      category::text AS category,
      stock,
      image,
      is_hidden AS "isHidden",
      moderated_at AS "moderatedAt"
    `,
    [productId, Boolean(isHidden)],
  )
  return rows[0] || null
}

async function deleteProduct(productId) {
  const { rows } = await query(
    `
    DELETE FROM products
    WHERE id = $1
    RETURNING id, name
    `,
    [productId],
  )
  return rows[0] || null
}

module.exports = {
  getAnalytics,
  listUsers,
  updateUserRole,
  countAdmins,
  deleteUser,
  findUserById,
  listModerationProducts,
  setProductHidden,
  deleteProduct,
}
