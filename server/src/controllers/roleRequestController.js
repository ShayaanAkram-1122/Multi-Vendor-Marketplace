const roleRequestQueries = require('../db/queries/roleRequests')
const { findUserById } = require('../db/queries/auth')
const adminQueries = require('../db/queries/admin')

const SWITCHABLE = new Set(['buyer', 'seller'])

function oppositeRole(role) {
  if (role === 'buyer') return 'seller'
  if (role === 'seller') return 'buyer'
  return null
}

async function getMyRoleRequest(req, res, next) {
  try {
    const user = await findUserById(req.user.id)
    if (!user) return res.status(401).json({ message: 'User not found' })

    if (user.role === 'admin') {
      return res.json({
        allowed: false,
        reason: 'Admin roles cannot be changed through requests.',
        request: null,
      })
    }

    if (!SWITCHABLE.has(user.role)) {
      return res.json({ allowed: false, reason: 'Role changes are not available for this account.', request: null })
    }

    const request = await roleRequestQueries.findLatestByUser(user.id)
    return res.json({
      allowed: true,
      currentRole: user.role,
      requestedRole: oppositeRole(user.role),
      request,
    })
  } catch (err) {
    return next(err)
  }
}

async function createRoleRequest(req, res, next) {
  try {
    const user = await findUserById(req.user.id)
    if (!user) return res.status(401).json({ message: 'User not found' })

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin roles cannot be changed' })
    }

    if (!SWITCHABLE.has(user.role)) {
      return res.status(400).json({ message: 'Only buyers and sellers can request a role change' })
    }

    const toRole = oppositeRole(user.role)
    const message = String(req.body.message || '').trim() || null

    const existing = await roleRequestQueries.findPendingByUser(user.id)
    if (existing) {
      return res.status(409).json({
        message: 'You already have a pending role change request',
        request: existing,
      })
    }

    const request = await roleRequestQueries.createRequest({
      userId: user.id,
      fromRole: user.role,
      toRole,
      message,
    })

    return res.status(201).json({
      message: `Request submitted to become a ${toRole}`,
      request,
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'You already have a pending role change request' })
    }
    return next(err)
  }
}

async function listRoleRequests(req, res, next) {
  try {
    const requests = await roleRequestQueries.listPendingRequests()
    return res.json({ data: requests })
  } catch (err) {
    return next(err)
  }
}

async function approveRoleRequest(req, res, next) {
  try {
    const pending = await roleRequestQueries.findRequestById(req.params.id)
    if (!pending || pending.status !== 'pending') {
      return res.status(404).json({ message: 'Pending request not found' })
    }

    if (pending.currentRole === 'admin') {
      return res.status(400).json({ message: 'Cannot change an admin role' })
    }

    if (!SWITCHABLE.has(pending.toRole) || !SWITCHABLE.has(pending.fromRole)) {
      return res.status(400).json({ message: 'Only buyer and seller roles can be swapped' })
    }

    if (pending.currentRole !== pending.fromRole) {
      await roleRequestQueries.setRequestStatus({
        requestId: pending.id,
        status: 'rejected',
        reviewedBy: req.user.id,
      })
      return res.status(400).json({
        message: 'User role changed since this request was made. Request was closed.',
      })
    }

    const user = await adminQueries.updateUserRole(pending.userId, pending.toRole)
    const request = await roleRequestQueries.setRequestStatus({
      requestId: pending.id,
      status: 'approved',
      reviewedBy: req.user.id,
    })

    return res.json({
      message: `Approved — ${pending.userName} is now a ${pending.toRole}`,
      user,
      request,
    })
  } catch (err) {
    return next(err)
  }
}

async function rejectRoleRequest(req, res, next) {
  try {
    const pending = await roleRequestQueries.findRequestById(req.params.id)
    if (!pending || pending.status !== 'pending') {
      return res.status(404).json({ message: 'Pending request not found' })
    }

    const request = await roleRequestQueries.setRequestStatus({
      requestId: pending.id,
      status: 'rejected',
      reviewedBy: req.user.id,
    })

    return res.json({
      message: 'Role change request rejected',
      request,
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  getMyRoleRequest,
  createRoleRequest,
  listRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  oppositeRole,
  SWITCHABLE,
}
