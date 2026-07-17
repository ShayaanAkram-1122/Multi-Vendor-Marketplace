const express = require('express')
const { authenticate } = require('../middleware/auth')
const salesController = require('../controllers/salesController')

const router = express.Router()

router.get('/active', salesController.listActiveSales)
router.get('/popup', authenticate, salesController.getSalePopup)

module.exports = router
