const express = require('express')
const helpController = require('../controllers/helpController')

const router = express.Router()

router.post('/', helpController.submitHelp)

module.exports = router
