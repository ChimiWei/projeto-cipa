const express = require('express')
const router = express.Router()
const asyncErrorHandler = require('../middleware/asyncErrorHandler')
const { homeController, cipaconfigController, candidatoController } = require('../controllers/index')


router.get('/', asyncErrorHandler(homeController.renderHome))

router.get('/cipaconfig', /*checkAuthenticated,*/ asyncErrorHandler(cipaconfigController.renderCipaConfig))

router.post('/cipaconfig', asyncErrorHandler(cipaconfigController.postCipaConfig))

router.get('/edit_cipa/:codfilial', /*checkAuthenticated,*/ asyncErrorHandler(cipaconfigController.renderCipaConfigEdit))

router.put('/edit_cipa/:codfilial', /*checkAuthenticated,*/ asyncErrorHandler(cipaconfigController.putCipaConfigEdit))

router.get('/cadastro_candidato/:codfilial', /*checkAuthenticated,*/ asyncErrorHandler(candidatoController.renderCadastroCandidato))

router.get('/fichaCandidato/:codfilial/:chapa', /*checkAuthenticated,*/ asyncErrorHandler(candidatoController.renderFichaCandidato))

router.put('/fichaCandidato', /*checkAuthenticated,*/ asyncErrorHandler(candidatoController.putFichaCandidato))

module.exports = router