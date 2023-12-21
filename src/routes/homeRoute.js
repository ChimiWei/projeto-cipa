const express = require('express')
const router = express.Router()
const asyncErrorHandler = require('../middleware/asyncErrorHandler')
const homeController = require('../controllers/homeController')


router.get('/', asyncErrorHandler(homeController.renderHome))

module.exports = router