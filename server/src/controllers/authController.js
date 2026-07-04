const bcrypt = require('bcryptjs')
const authQueries = require('../db/queries/auth')
const {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshExpiryDate,
  getRefreshCookieOptions,
  REFRESH_COOKIE_NAME,
} = require('../utils/tokens')

const ALLOWED_ROLES = new Set(['buyer', 'seller'])
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12)

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  }
}

function clientMeta(req) {
  return {
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  }
}

async function issueSession(res, user, req) {
  const accessToken = signAccessToken(user)
  const refreshToken = generateRefreshToken()
  const tokenHash = hashToken(refreshToken)
  const expiresAt = getRefreshExpiryDate()
  const meta = clientMeta(req)

  await authQueries.storeRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  })

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions())

  return {
    user: publicUser(user),
    accessToken,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  }
}

async function register(req, res, next) {
  try {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const role = String(req.body.role || 'buyer').toLowerCase()

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ message: 'Role must be buyer or seller' })
    }

    const existing = await authQueries.findUserByEmail(email)
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' })
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const user = await authQueries.createUser({
      name,
      email,
      passwordHash,
      role,
    })

    const session = await issueSession(res, user, req)
    return res.status(201).json(session)
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Email is already registered' })
    }
    return next(err)
  }
}

async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await authQueries.findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const session = await issueSession(res, user, req)
    return res.json(session)
  } catch (err) {
    return next(err)
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' })
    }

    const tokenHash = hashToken(refreshToken)
    const stored = await authQueries.findValidRefreshToken(tokenHash)
    if (!stored) {
      res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions())
      return res.status(401).json({ message: 'Invalid or expired refresh token' })
    }

    // Rotate refresh token
    await authQueries.revokeRefreshToken(tokenHash)

    const user = {
      id: stored.user_id,
      name: stored.name,
      email: stored.email,
      role: stored.role,
    }

    const session = await issueSession(res, user, req)
    return res.json(session)
  } catch (err) {
    return next(err)
  }
}

async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken
    if (refreshToken) {
      await authQueries.revokeRefreshToken(hashToken(refreshToken))
    }

    res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions())
    return res.json({ message: 'Logged out' })
  } catch (err) {
    return next(err)
  }
}

async function logoutAll(req, res, next) {
  try {
    await authQueries.revokeAllUserRefreshTokens(req.user.id)
    res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions())
    return res.json({ message: 'Logged out from all sessions' })
  } catch (err) {
    return next(err)
  }
}

async function me(req, res, next) {
  try {
    const user = await authQueries.findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ user: publicUser(user) })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me,
}
