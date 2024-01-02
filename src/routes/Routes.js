const express = require('express')
const router = express.Router()
const asyncErrorHandler = require('../middleware/asyncErrorHandler')
const { homeController, cipaconfigController } = require('../controllers/index')


router.get('/', asyncErrorHandler(homeController.renderHome))

router.get('/cipaconfig', /*checkAuthenticated,*/ asyncErrorHandler(cipaconfigController.renderCipaConfig))

router.post('/cipaconfig', asyncErrorHandler(cipaconfigController.postCipaConfig))

module.exports = router