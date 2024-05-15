const express = require('express')
const router = express.Router()
const asyncErrorHandler = require('../middleware/asyncErrorHandler')
const checkAuthenticated = require('../middleware/checkAuthenticated')
const checkNotAuthenticated = require('../middleware/checkNotAuthenticate')
const AuthenticateTokenJWT = require('../middleware/AuthenticateTokenJWT')
const { homeController, cipaconfigController, candidatoController, votacaoController,
    listagemController, editcipaController, userController, showTokenController } = require('../controllers/index')

router.get('/login', checkNotAuthenticated, userController.renderLogin)

router.post('/login', checkNotAuthenticated, userController.postLogin)

router.get('/register', checkNotAuthenticated, userController.renderRegister)

router.post('/register', checkNotAuthenticated, asyncErrorHandler(userController.postRegister))

router.get('/', checkAuthenticated, asyncErrorHandler(homeController.renderHome))

router.get('/cipaconfig', checkAuthenticated, asyncErrorHandler(cipaconfigController.renderCipaConfig))

router.post('/cipaconfig', checkAuthenticated, asyncErrorHandler(cipaconfigController.postCipaConfig))

router.get('/cipatoken', checkAuthenticated, AuthenticateTokenJWT, asyncErrorHandler(showTokenController.getShowToken))

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

router.post('/autorizar_acesso/:codfilial', checkAuthenticated, asyncErrorHandler(listagemController.postAutorizarAcesso))

router.get('/candidatos_auth/:codfilial', checkAuthenticated, asyncErrorHandler(listagemController.renderListCandidato))

router.get('/candidatos/:codfilial', checkAuthenticated, asyncErrorHandler(listagemController.renderlistCandidatoSemCount))

router.get('/votos/:codfilial', checkAuthenticated, asyncErrorHandler(listagemController.renderVotos))

router.get('/autorizar_edit/:codfilial', checkAuthenticated, editcipaController.getEditarCipa)

router.put('/autorizar_edit/:codfilial', checkAuthenticated, asyncErrorHandler(editcipaController.putEditarCipa))

router.delete('/logout', checkAuthenticated, userController.deleteLogout)

module.exports = router