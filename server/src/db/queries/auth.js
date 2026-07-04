const { query } = require('../../config/db')

const CREATE_USER = `
  INSERT INTO users (name, email, password_hash, role)
  VALUES ($1, lower($2), $3, $4)
  RETURNING id, name, email, role, created_at
`

const FIND_USER_BY_EMAIL = `
  SELECT id, name, email, password_hash, role, created_at
  FROM users
  WHERE email = lower($1)
  LIMIT 1
`

const FIND_USER_BY_ID = `
  SELECT id, name, email, role, created_at
  FROM users
  WHERE id = $1
  LIMIT 1
`

const INSERT_REFRESH_TOKEN = `
  INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, user_id, expires_at, created_at
`

const FIND_VALID_REFRESH_TOKEN = `
  SELECT
    rt.id,
    rt.user_id,
    rt.token_hash,
    rt.expires_at,
    rt.revoked_at,
    u.id AS user_id,
    u.name,
    u.email,
    u.role
  FROM refresh_tokens rt
  INNER JOIN users u ON u.id = rt.user_id
  WHERE rt.token_hash = $1
    AND rt.revoked_at IS NULL
    AND rt.expires_at > NOW()
  LIMIT 1
`

const REVOKE_REFRESH_TOKEN = `
  UPDATE refresh_tokens
  SET revoked_at = NOW()
  WHERE token_hash = $1
    AND revoked_at IS NULL
  RETURNING id
`

const REVOKE_ALL_USER_REFRESH_TOKENS = `
  UPDATE refresh_tokens
  SET revoked_at = NOW()
  WHERE user_id = $1
    AND revoked_at IS NULL
`

const DELETE_EXPIRED_REFRESH_TOKENS = `
  DELETE FROM refresh_tokens
  WHERE expires_at < NOW()
     OR revoked_at IS NOT NULL
`

async function createUser({ name, email, passwordHash, role }) {
  const { rows } = await query(CREATE_USER, [name, email, passwordHash, role])
  return rows[0]
}

async function findUserByEmail(email) {
  const { rows } = await query(FIND_USER_BY_EMAIL, [email])
  return rows[0] || null
}

async function findUserById(id) {
  const { rows } = await query(FIND_USER_BY_ID, [id])
  return rows[0] || null
}

async function storeRefreshToken({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
  const { rows } = await query(INSERT_REFRESH_TOKEN, [
    userId,
    tokenHash,
    expiresAt,
    userAgent || null,
    ipAddress || null,
  ])
  return rows[0]
}

async function findValidRefreshToken(tokenHash) {
  const { rows } = await query(FIND_VALID_REFRESH_TOKEN, [tokenHash])
  return rows[0] || null
}

async function revokeRefreshToken(tokenHash) {
  const { rows } = await query(REVOKE_REFRESH_TOKEN, [tokenHash])
  return rows[0] || null
}

async function revokeAllUserRefreshTokens(userId) {
  await query(REVOKE_ALL_USER_REFRESH_TOKENS, [userId])
}

async function cleanupRefreshTokens() {
  await query(DELETE_EXPIRED_REFRESH_TOKENS)
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  storeRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  cleanupRefreshTokens,
  // exported for reference / tests
  SQL: {
    CREATE_USER,
    FIND_USER_BY_EMAIL,
    FIND_USER_BY_ID,
    INSERT_REFRESH_TOKEN,
    FIND_VALID_REFRESH_TOKEN,
    REVOKE_REFRESH_TOKEN,
    REVOKE_ALL_USER_REFRESH_TOKENS,
    DELETE_EXPIRED_REFRESH_TOKENS,
  },
}
