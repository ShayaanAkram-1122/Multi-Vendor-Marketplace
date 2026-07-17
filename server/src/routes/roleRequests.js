const express = require('express')
const { authenticate } = require('../middleware/auth')
const roleRequestController = require('../controllers/roleRequestController')

const router = express.Router()

router.get('/me', authenticate, roleRequestController.getMyRoleRequest)
router.post('/', authenticate, roleRequestController.createRoleRequest)

module.exports = router
