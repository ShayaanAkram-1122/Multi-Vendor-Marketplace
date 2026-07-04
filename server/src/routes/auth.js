const express = require('express')
const authController = require('../controllers/authController')
const { authenticate, requireAdmin, requireSeller, requireBuyer } = require('../middleware/auth')

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.post('/logout-all', authenticate, authController.logoutAll)
router.get('/me', authenticate, authController.me)

// Example role-guarded routes (remove or extend as features land)
router.get('/admin/ping', ...requireAdmin, (_req, res) => {
  res.json({ ok: true, scope: 'admin' })
})

router.get('/seller/ping', ...requireSeller, (_req, res) => {
  res.json({ ok: true, scope: 'seller' })
})

router.get('/buyer/ping', ...requireBuyer, (_req, res) => {
  res.json({ ok: true, scope: 'buyer' })
})

module.exports = router
