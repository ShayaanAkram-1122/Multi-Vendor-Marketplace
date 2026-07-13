const express = require('express')
const productController = require('../controllers/productController')
const { requireSeller } = require('../middleware/auth')

const router = express.Router()

router.get('/', productController.list)
router.get('/ai-picks', productController.aiPicks)
router.post('/', ...requireSeller, productController.create)
router.patch('/:id/discount', ...requireSeller, productController.setDiscount)

module.exports = router
