const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m'
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d'
const REFRESH_COOKIE_NAME = 'vendora_refresh'

function getAccessSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not configured')
  return secret
}

function getRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET || getAccessSecret()
}

function parseDurationToMs(value) {
  const match = String(value).trim().match(/^(\d+)([smhd])$/i)
  if (!match) return 7 * 24 * 60 * 60 * 1000

  const amount = Number(match[1])
  const unit = match[2].toLowerCase()
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
  return amount * multipliers[unit]
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    },
    getAccessSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRES },
  )
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, getAccessSecret())
  if (payload.type !== 'access') {
    const err = new Error('Invalid access token')
    err.name = 'JsonWebTokenError'
    throw err
  }
  return payload
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex')
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function getRefreshExpiryDate() {
  return new Date(Date.now() + parseDurationToMs(REFRESH_TOKEN_EXPIRES))
}

function getRefreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: parseDurationToMs(REFRESH_TOKEN_EXPIRES),
  }
}

module.exports = {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
  REFRESH_COOKIE_NAME,
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshExpiryDate,
  getRefreshCookieOptions,
}
