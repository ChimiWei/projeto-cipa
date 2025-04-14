const express = require('express')
const router = express.Router()
const asyncErrorHandler = require('../middleware/asyncErrorHandler')
const checkAuthenticated = require('../middleware/checkAuthenticated')
const checkNotAuthenticated = require('../middleware/checkNotAuthenticate')
const AuthenticateTokenJWT = require('../middleware/authenticateTokenJWT')
const { 
    homeController, cipaController, cipaconfigController, candidatoController, votacaoController,
    listagemController, finalizarcipaController, userController, showTokenController, adminController, 
    
} = require('../controllers/index')
const checkVerified = require('../middleware/checkVerified')
const checkAdmin = require('../middleware/checkAdmin')

router.get('/', homeController.renderHome)

router.post('/orcamento', asyncErrorHandler(homeController.postMail))

router.get('/login', checkNotAuthenticated, userController.renderLogin)

router.get('/reset_password', checkNotAuthenticated, userController.renderResetPassword)

router.post('/reset_password', checkNotAuthenticated, userController.postResetPassword)

router.post('/login', checkNotAuthenticated, asyncErrorHandler(userController.postLogin))

router.get('/register', checkNotAuthenticated, userController.renderRegister)

router.post('/register', checkNotAuthenticated, asyncErrorHandler(userController.postRegister))

router.get('/admin', checkAdmin, asyncErrorHandler(adminController.renderAdmin))

router.put('/admin/:cipaid', checkAdmin, asyncErrorHandler(adminController.putAdmin))

router.get('/admin/usuarios', checkAdmin, asyncErrorHandler(adminController.renderAdminUsuarios))

router.put('/admin/verify/:userid', checkAdmin, asyncErrorHandler(adminController.putAdminVerifyUser))

router.get('/admin/register', checkAdmin, adminController.renderAdminRegister)

router.put('/admin_register', checkAdmin, asyncErrorHandler(adminController.putAdminRegister))

router.put('/generate_convitetoken', checkAdmin, asyncErrorHandler(adminController.putGenerateInviteToken))

router.get('/nao_verificado', checkVerified, userController.renderNotVerificado)

router.get('/cipa', checkAuthenticated, asyncErrorHandler(cipaController.renderCipa))

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

router.get('/autorizar_finalizar/:codfilial', checkAuthenticated, finalizarcipaController.getFinalizarCipa)

router.put('/autorizar_finalizar/:codfilial', checkAuthenticated, asyncErrorHandler(finalizarcipaController.putFinalizarCipa))

router.delete('/logout', userController.deleteLogout)

module.exports = router