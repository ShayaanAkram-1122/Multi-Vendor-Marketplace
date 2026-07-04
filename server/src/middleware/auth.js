const { verifyAccessToken } = require('../utils/tokens')
const { findUserById } = require('../db/queries/auth')

function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  const token = header.slice(7)

  try {
    const payload = verifyAccessToken(token)
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
    return next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired' })
    }
    return res.status(401).json({ message: 'Invalid access token' })
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    return next()
  }
}

const requireAdmin = [authenticate, authorize('admin')]
const requireSeller = [authenticate, authorize('seller', 'admin')]
const requireBuyer = [authenticate, authorize('buyer', 'admin')]
const requireSellerOrBuyer = [authenticate, authorize('seller', 'buyer', 'admin')]

async function attachFreshUser(req, res, next) {
  try {
    const user = await findUserById(req.user.id)
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }
    req.user = user
    return next()
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireSeller,
  requireBuyer,
  requireSellerOrBuyer,
  attachFreshUser,
}
