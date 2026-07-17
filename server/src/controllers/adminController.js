const adminQueries = require('../db/queries/admin')
const productQueries = require('../db/queries/products')
const { notifyMarketingSubscribers } = require('../services/newsletterNotify')

async function getAnalytics(req, res, next) {
  try {
    const data = await adminQueries.getAnalytics()
    return res.json(data)
  } catch (err) {
    return next(err)
  }
}

async function listUsers(req, res, next) {
  try {
    const data = await adminQueries.listUsers({
      search: req.query.search,
      role: req.query.role,
      page: req.query.page,
      limit: req.query.limit,
    })
    return res.json(data)
  } catch (err) {
    return next(err)
  }
}

async function updateUserRole(req, res, next) {
  try {
    const userId = req.params.id
    const role = String(req.body.role || '').toLowerCase()

    // Admins can only switch buyer ↔ seller. Admin roles are locked.
    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ message: 'Only buyer and seller roles can be assigned' })
    }

    const existing = await adminQueries.findUserById(userId)
    if (!existing) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (existing.role === 'admin') {
      return res.status(403).json({ message: 'Admin roles cannot be changed' })
    }

    if (!['buyer', 'seller'].includes(existing.role)) {
      return res.status(400).json({ message: 'Only buyer and seller accounts can have their role changed' })
    }

    if (existing.role === role) {
      return res.json({ message: 'Role unchanged', user: existing })
    }

    const user = await adminQueries.updateUserRole(userId, role)
    return res.json({ message: 'Role updated', user })
  } catch (err) {
    return next(err)
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = req.params.id

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' })
    }

    const existing = await adminQueries.findUserById(userId)
    if (!existing) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (existing.role === 'admin') {
      const adminCount = await adminQueries.countAdmins()
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin account' })
      }
    }

    const deleted = await adminQueries.deleteUser(userId)
    return res.json({ message: 'User deleted', user: deleted })
  } catch (err) {
    return next(err)
  }
}

async function listModerationProducts(req, res, next) {
  try {
    const data = await adminQueries.listModerationProducts({
      search: req.query.search,
      filter: req.query.filter || 'all',
      page: req.query.page,
      limit: req.query.limit,
    })
    return res.json(data)
  } catch (err) {
    return next(err)
  }
}

async function hideProduct(req, res, next) {
  try {
    const product = await adminQueries.setProductHidden(req.params.id, true)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    return res.json({ message: 'Product hidden from shop', product })
  } catch (err) {
    return next(err)
  }
}

async function restoreProduct(req, res, next) {
  try {
    const product = await adminQueries.setProductHidden(req.params.id, false)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    return res.json({ message: 'Product restored to shop', product })
  } catch (err) {
    return next(err)
  }
}

async function deleteProduct(req, res, next) {
  try {
    const deleted = await adminQueries.deleteProduct(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Product not found' })
    return res.json({ message: 'Product deleted', product: deleted })
  } catch (err) {
    return next(err)
  }
}

async function applySale(req, res, next) {
  try {
    const productId = Number(req.params.id)
    const discountPercent = Number(req.body.discountPercent)

    if (!Number.isFinite(productId)) {
      return res.status(400).json({ message: 'Valid product id is required' })
    }
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({ message: 'Sale percent must be between 0 and 100' })
    }

    const product = await productQueries.updateProductDiscount(productId, discountPercent)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    let notify = { sent: 0, skipped: 0 }
    if (discountPercent > 0) {
      try {
        notify = await notifyMarketingSubscribers({ type: 'discount', product })
      } catch (err) {
        console.error('[mail] admin sale notify failed:', err.message)
      }
    }

    return res.json({
      message:
        discountPercent > 0
          ? `Sale applied (−${discountPercent}%). ${notify.sent} subscriber email(s) sent.`
          : 'Sale removed from product.',
      product,
      notify,
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  getAnalytics,
  listUsers,
  updateUserRole,
  deleteUser,
  listModerationProducts,
  hideProduct,
  restoreProduct,
  deleteProduct,
  applySale,
}
