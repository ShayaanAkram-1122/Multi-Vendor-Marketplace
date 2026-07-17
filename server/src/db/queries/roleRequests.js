const { query } = require('../../config/db')

async function findPendingByUser(userId) {
  const { rows } = await query(
    `
    SELECT
      id,
      user_id AS "userId",
      from_role::text AS "fromRole",
      to_role::text AS "toRole",
      message,
      status::text AS status,
      created_at AS "createdAt"
    FROM role_change_requests
    WHERE user_id = $1 AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId],
  )
  return rows[0] || null
}

async function findLatestByUser(userId) {
  const { rows } = await query(
    `
    SELECT
      id,
      user_id AS "userId",
      from_role::text AS "fromRole",
      to_role::text AS "toRole",
      message,
      status::text AS status,
      created_at AS "createdAt",
      reviewed_at AS "reviewedAt"
    FROM role_change_requests
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId],
  )
  return rows[0] || null
}

async function createRequest({ userId, fromRole, toRole, message }) {
  const { rows } = await query(
    `
    INSERT INTO role_change_requests (user_id, from_role, to_role, message)
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      user_id AS "userId",
      from_role::text AS "fromRole",
      to_role::text AS "toRole",
      message,
      status::text AS status,
      created_at AS "createdAt"
    `,
    [userId, fromRole, toRole, message || null],
  )
  return rows[0]
}

async function listPendingRequests() {
  const { rows } = await query(
    `
    SELECT
      r.id,
      r.user_id AS "userId",
      u.name AS "userName",
      u.email AS "userEmail",
      r.from_role::text AS "fromRole",
      r.to_role::text AS "toRole",
      r.message,
      r.status::text AS status,
      r.created_at AS "createdAt"
    FROM role_change_requests r
    INNER JOIN users u ON u.id = r.user_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at ASC
    `,
  )
  return rows
}

async function findRequestById(id) {
  const { rows } = await query(
    `
    SELECT
      r.id,
      r.user_id AS "userId",
      u.name AS "userName",
      u.email AS "userEmail",
      u.role::text AS "currentRole",
      r.from_role::text AS "fromRole",
      r.to_role::text AS "toRole",
      r.message,
      r.status::text AS status,
      r.created_at AS "createdAt"
    FROM role_change_requests r
    INNER JOIN users u ON u.id = r.user_id
    WHERE r.id = $1
    `,
    [id],
  )
  return rows[0] || null
}

async function setRequestStatus({ requestId, status, reviewedBy }) {
  const { rows } = await query(
    `
    UPDATE role_change_requests
    SET status = $2,
        reviewed_by = $3,
        reviewed_at = NOW()
    WHERE id = $1 AND status = 'pending'
    RETURNING
      id,
      user_id AS "userId",
      from_role::text AS "fromRole",
      to_role::text AS "toRole",
      status::text AS status
    `,
    [requestId, status, reviewedBy],
  )
  return rows[0] || null
}

module.exports = {
  findPendingByUser,
  findLatestByUser,
  createRequest,
  listPendingRequests,
  findRequestById,
  setRequestStatus,
}
