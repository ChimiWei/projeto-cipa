const express = require('express')
const router = express.Router()
const asyncErrorHandler = require('../middleware/asyncErrorHandler')
const { homeController, cipaconfigController, candidatoController, votacaoController } = require('../controllers/index')


router.get('/', asyncErrorHandler(homeController.renderHome))

router.get('/cipaconfig', /*checkAuthenticated,*/ asyncErrorHandler(cipaconfigController.renderCipaConfig))

router.post('/cipaconfig', asyncErrorHandler(cipaconfigController.postCipaConfig))

router.get('/edit_cipa/:codfilial', /*checkAuthenticated,*/ asyncErrorHandler(cipaconfigController.renderCipaConfigEdit))

router.put('/edit_cipa/:codfilial', /*checkAuthenticated,*/ asyncErrorHandler(cipaconfigController.putCipaConfigEdit))

router.get('/cadastro_candidato/:codfilial', /*checkAuthenticated,*/ asyncErrorHandler(candidatoController.renderCadastroCandidato))

router.get('/fichaCandidato/:codfilial/:chapa', /*checkAuthenticated,*/ asyncErrorHandler(candidatoController.renderFichaCandidato))

router.put('/fichaCandidato', /*checkAuthenticated,*/ asyncErrorHandler(candidatoController.putFichaCandidato))

router.get('/iniciar_votacao/:codfilial', asyncErrorHandler(votacaoController.renderIniciarVotacao))

router.post('/iniciar_votacao/:codfilial', asyncErrorHandler(votacaoController.postIniciarVotacao))

router.get('/votacao/:codfilial', asyncErrorHandler(votacaoController.renderVotacao))

router.post('/votacao/:codfilial', votacaoController.postVotacao)

router.get('/confirmar_voto/:codfilial/:nvotacao', asyncErrorHandler(votacaoController.renderConfirmarVoto))

router.put('/confirmar_voto/:nvotacao', asyncErrorHandler(votacaoController.putConfirmarVoto))

router.get('/voto_finalizado/:codfilial', votacaoController.renderVotoFinalizado)

module.exports = router