const express = require('express')
const router = express.Router()
const asyncErrorHandler = require('../middleware/asyncErrorHandler')
const checkAuthenticated = require('../middleware/checkAuthenticated')
const { homeController, cipaconfigController, candidatoController, votacaoController, listagemController, suspendercipaController} = require('../controllers/index')


router.get('/', checkAuthenticated, asyncErrorHandler(homeController.renderHome))

router.get('/cipaconfig', checkAuthenticated, asyncErrorHandler(cipaconfigController.renderCipaConfig))

router.post('/cipaconfig', asyncErrorHandler(cipaconfigController.postCipaConfig))

router.get('/edit_cipa/:codfilial', checkAuthenticated, asyncErrorHandler(cipaconfigController.renderCipaConfigEdit))

router.put('/edit_cipa/:codfilial', checkAuthenticated, asyncErrorHandler(cipaconfigController.putCipaConfigEdit))

router.get('/cadastro_candidato/:codfilial', checkAuthenticated, asyncErrorHandler(candidatoController.renderCadastroCandidato))

router.get('/fichaCandidato/:codfilial/:chapa', checkAuthenticated, asyncErrorHandler(candidatoController.renderFichaCandidato))

router.put('/fichaCandidato', checkAuthenticated, asyncErrorHandler(candidatoController.putFichaCandidato))

router.get('/iniciar_votacao/:codfilial', checkAuthenticated, asyncErrorHandler(votacaoController.renderIniciarVotacao))

router.post('/iniciar_votacao/:codfilial', checkAuthenticated, asyncErrorHandler(votacaoController.postIniciarVotacao))

router.get('/votacao/:codfilial', checkAuthenticated, asyncErrorHandler(votacaoController.renderVotacao))

router.post('/votacao/:codfilial', checkAuthenticated, votacaoController.postVotacao)

router.get('/confirmar_voto/:codfilial/:nvotacao', checkAuthenticated, asyncErrorHandler(votacaoController.renderConfirmarVoto))

router.put('/confirmar_voto/:nvotacao', checkAuthenticated, asyncErrorHandler(votacaoController.putConfirmarVoto))

router.get('/voto_finalizado/:codfilial', checkAuthenticated, votacaoController.renderVotoFinalizado)

router.get('/autorizar_acesso/:codfilial', checkAuthenticated, listagemController.renderAutorizarAcesso)

router.post('/autorizar_acesso/:codfilial', checkAuthenticated, asyncErrorHandler(listagemController.postAutorizarAcesso) )

router.get('/candidatos/:codfilial', checkAuthenticated, asyncErrorHandler(listagemController.renderListCandidato))

router.get('/votos/:codfilial', checkAuthenticated, asyncErrorHandler(listagemController.renderVotos))

router.get('/suspender_cipa/:codfilial', checkAuthenticated, suspendercipaController.renderSuspenderCipa)

router.put('/suspender_cipa/:codfilial', checkAuthenticated, asyncErrorHandler(suspendercipaController.putSuspenderCipa))

module.exports = router