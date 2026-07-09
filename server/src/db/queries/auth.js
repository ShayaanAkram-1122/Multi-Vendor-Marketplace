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

const INVALIDATE_USER_PASSWORD_RESET_TOKENS = `
  UPDATE password_reset_tokens
  SET used_at = NOW()
  WHERE user_id = $1
    AND used_at IS NULL
`

const INSERT_PASSWORD_RESET_TOKEN = `
  INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
  VALUES ($1, $2, $3)
  RETURNING id, user_id, expires_at, created_at
`

const FIND_VALID_PASSWORD_RESET_TOKEN = `
  SELECT
    prt.id,
    prt.user_id,
    prt.token_hash,
    prt.expires_at,
    u.email,
    u.name
  FROM password_reset_tokens prt
  INNER JOIN users u ON u.id = prt.user_id
  WHERE prt.token_hash = $1
    AND prt.used_at IS NULL
    AND prt.expires_at > NOW()
  LIMIT 1
`

const MARK_PASSWORD_RESET_TOKEN_USED = `
  UPDATE password_reset_tokens
  SET used_at = NOW()
  WHERE token_hash = $1
    AND used_at IS NULL
  RETURNING id
`

const UPDATE_USER_PASSWORD = `
  UPDATE users
  SET password_hash = $2
  WHERE id = $1
  RETURNING id, name, email, role, created_at
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

async function invalidateUserPasswordResetTokens(userId) {
  await query(INVALIDATE_USER_PASSWORD_RESET_TOKENS, [userId])
}

async function storePasswordResetToken({ userId, tokenHash, expiresAt }) {
  const { rows } = await query(INSERT_PASSWORD_RESET_TOKEN, [userId, tokenHash, expiresAt])
  return rows[0]
}

async function findValidPasswordResetToken(tokenHash) {
  const { rows } = await query(FIND_VALID_PASSWORD_RESET_TOKEN, [tokenHash])
  return rows[0] || null
}

async function markPasswordResetTokenUsed(tokenHash) {
  const { rows } = await query(MARK_PASSWORD_RESET_TOKEN_USED, [tokenHash])
  return rows[0] || null
}

async function updateUserPassword(userId, passwordHash) {
  const { rows } = await query(UPDATE_USER_PASSWORD, [userId, passwordHash])
  return rows[0]
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
  invalidateUserPasswordResetTokens,
  storePasswordResetToken,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
  updateUserPassword,
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
    INVALIDATE_USER_PASSWORD_RESET_TOKENS,
    INSERT_PASSWORD_RESET_TOKEN,
    FIND_VALID_PASSWORD_RESET_TOKEN,
    MARK_PASSWORD_RESET_TOKEN_USED,
    UPDATE_USER_PASSWORD,
  },
}
