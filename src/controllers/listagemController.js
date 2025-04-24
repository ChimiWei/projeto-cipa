const { getCipaAtiva } = require('../models/cipaModel')
const repository = require('../helpers/query-repo')
const mysqlPromise = require('../helpers/mysqlQuery')
const { setCandidatosPageAuth, getCandidatosPageAuth } = require("../models/authModel")
const getCandidatos = require('../helpers/getCandidatos')
const ConvertBufferAndReturnImageURL = require('../helpers/convertBufferAndReturnImage')
const queryImageAndReturnURL = require('../helpers/queryImageAndReturnURL')


const listagemController = {
    renderAutorizarAcesso: (req, res) => {

        res.render('autorizarAcesso.ejs', { user: req.user, codfilial: req.params.codfilial, message: req.flash() })
    },
    postAutorizarAcesso: async (req, res) => {
        const cipas = await getCipaAtiva()
        const codfilial = req.params.codfilial
        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
        if (!cipa) return res.redirect('/cipa')

        const [rows] = await mysqlPromise.query(...repository.mysql.getCipaToken(cipa.id))
        const { token } = rows[0]

        if (req.body.token === token) {
            setCandidatosPageAuth(true)
            return res.redirect(`/candidatos_auth/${codfilial}`)
        } else {
            req.flash("error", "Token Incorreto")
            return res.redirect(`/autorizar_acesso/${codfilial}`)
        }
    },
    renderListCandidato: async (req, res) => {
        var candidatosPageAuth = getCandidatosPageAuth()
        if (!candidatosPageAuth) return res.redirect('/cipa')
        setCandidatosPageAuth(false)

        const [result] = await mysqlPromise.query(...repository.mysql.getApi(req.user.id_empresa))
        const api = result[0]
        if(!api) return res.redirect('/cipa')
          
        const apiRequest = {
            url: `${api.url}/CI.006/1/P?parameters=IDIMAGEM=`,
            encodedUser: api.encoded_user
        }

        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa) return res.redirect('/cipa')

        const candidatos = await getCandidatos(cipa.id)

        // bubble sort lets gooooooooooo
        for (let i = 0; i < candidatos.length; i++) {
            for (let j = 0; j < candidatos.length - 1; j++) {
                if (candidatos[j].votos < candidatos[j + 1].votos) {
                    const temp = candidatos[j]
                    candidatos[j] = candidatos[j + 1]
                    candidatos[j + 1] = temp
                }
            }
        }

        const [rows] = await mysqlPromise.query(...repository.mysql.getVotos(cipa.id))
        const [branco, nulo] = rows

        res.render('listCandidato.ejs', { user: req.user, candidatos: candidatos, branco, nulo, url: apiRequest.url, encodedUser: apiRequest.encodedUser })
    },
    renderlistCandidatoSemCount: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa) return res.redirect('/cipa')

        const candidatos = await getCandidatos(cipa.id)

        const [result] = await mysqlPromise.query(...repository.mysql.getApi(req.user.id_empresa))
        const api = result[0]
        if(!api) return res.redirect('/cipa')
        
        const apiRequest = {
            url: `${api.url}/CI.006/1/P?parameters=IDIMAGEM=`,
            encodedUser: api.encoded_user
        }

        res.render('listCandidatoSemCount.ejs', { user: req.user, candidatos: candidatos, cipa: cipa, url: apiRequest.url, encodedUser: apiRequest.encodedUser })
    },
    renderVotos: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa) return res.redirect('/cipa')
        const [funcionarios] = await mysqlPromise.query(...repository.mysql.getFuncComVoto(cipa.id))
        const [rows] = await mysqlPromise.query(...repository.mysql.getTotalVotos(cipa.id))
        const [votos] = rows

        cipa.total = votos.total
        res.render('listVotos.ejs', { user: req.user, funcionarios, cipa })
    }
}

module.exports = listagemController