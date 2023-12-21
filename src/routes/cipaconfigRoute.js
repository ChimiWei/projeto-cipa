const express = require('express')
const router = express.Router()
const asyncErrorHandler = require('../middleware/asyncErrorHandler')
const cipaconfigController = require('../controllers/cipaconfigController')


router.get('/cipaconfig', /*checkAuthenticated,*/ asyncErrorHandler(cipaconfigController.renderCipaConfig))

router.post('/cipaconfig', asyncErrorHandler(cipaconfigController.postCipaConfig))

module.exports = router