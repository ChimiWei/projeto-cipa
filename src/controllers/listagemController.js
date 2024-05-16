const { getCipaAtiva } = require('../models/cipaModel')
const repository = require('../helpers/query-repo')
const mysqlPromise = require('../helpers/mysqlQuery')
const { setCandidatosPageAuth, getCandidatosPageAuth } = require("../models/authModel")
const getCandidatos = require('../helpers/getCandidatos')
const ConvertBufferAndReturnImageURL = require('../helpers/convertBufferAndReturnImage')
const queryImageAndReturnURL = require('../helpers/queryImageAndReturnURL')


const listagemController = {
    renderAutorizarAcesso: (req, res) => {

        res.render('autorizarAcesso.ejs', { codfilial: req.params.codfilial, message: req.flash() })
    },
    postAutorizarAcesso: async (req, res) => {
        const cipas = await getCipaAtiva()
        const codfilial = req.params.codfilial
        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
        if (!cipa) return res.redirect('/')

        const [rows] = await mysqlPromise.query(...repository.mysql.getCipaToken(cipa.id, codfilial))
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
        if (!candidatosPageAuth) return res.redirect('/')
        setCandidatosPageAuth(false)
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa) return res.redirect('/')

        const candidatos = await getCandidatos(cipa.id)

        for(let i = 0; i < candidatos.length; i++) {
            candidatos[i].imagem = await queryImageAndReturnURL(candidatos[i].idimagem)
        }
        
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

        res.render('listCandidato.ejs', { user: req.user, candidatos: candidatos, branco, nulo })
    },
    renderlistCandidatoSemCount: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa) return res.redirect('/')

        const candidatos = await getCandidatos(cipa.id)

        for(let i = 0; i < candidatos.length; i++) {
            candidatos[i].imagem = await queryImageAndReturnURL(candidatos[i].idimagem)
        }

        res.render('listCandidatoSemCount.ejs', { candidatos: candidatos, cipa: cipa })
    },
    renderVotos: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa) return res.redirect('/')
        const [funcionarios] = await mysqlPromise.query(...repository.mysql.getFuncComVoto(cipa.id))
        res.render('listVotos.ejs', { funcionarios })
    }
}

module.exports = listagemController