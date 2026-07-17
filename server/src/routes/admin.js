const express = require('express')
const { requireAdmin } = require('../middleware/auth')
const adminController = require('../controllers/adminController')

const router = express.Router()

router.use(...requireAdmin)

router.get('/analytics', adminController.getAnalytics)
router.get('/users', adminController.listUsers)
router.patch('/users/:id/role', adminController.updateUserRole)
router.delete('/users/:id', adminController.deleteUser)

router.get('/moderation/products', adminController.listModerationProducts)
router.post('/moderation/products/:id/hide', adminController.hideProduct)
router.post('/moderation/products/:id/restore', adminController.restoreProduct)
router.delete('/moderation/products/:id', adminController.deleteProduct)

module.exports = router
