const { query } = require('../../config/db')

async function getAnalytics() {
  const [users, roles, products, categories, sellers, newsletter, recentUsers, lowStock] =
    await Promise.all([
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
          COUNT(*) FILTER (WHERE stock <= 5)::int AS low_stock,
          COALESCE(ROUND(AVG(price)::numeric, 2), 0)::float AS avg_price,
          COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::float AS avg_rating
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
    ])

  const roleMap = { admin: 0, seller: 0, buyer: 0 }
  for (const row of roles.rows) {
    roleMap[row.role] = row.count
  }

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
