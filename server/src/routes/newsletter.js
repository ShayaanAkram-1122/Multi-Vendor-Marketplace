const express = require('express')
const newsletterController = require('../controllers/newsletterController')

const router = express.Router()

router.post('/subscribe', newsletterController.subscribe)
router.get('/preference', newsletterController.setPreference)
router.post('/preference', newsletterController.setPreference)

module.exports = router
