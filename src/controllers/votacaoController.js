const { getCipaAtiva } = require('../models/cipaModel')
const votante = require('../models/votanteModel')
const repository = require('../helpers/query-repo')
const mysqlPromise = require('../helpers/mysqlQuery')
const { gestao, hoje, ano } = require('../models/dateModel')
const { mssqlStmtQuery } = require('../helpers/mssqlQuery')
const getCandidatos = require('../helpers/getCandidatos')
const checkCipaVotes = require('../helpers/checkCipaVotes')
const ConvertBufferAndReturnImageURL = require('../helpers/convertBufferAndReturnImage')
const queryImageAndReturnURL = require('../helpers/queryImageAndReturnURL')


const votacaoController = {
    renderIniciarVotacao: async (req, res) => {
        const cipas = await getCipaAtiva()
        const codfilial = req.params.codfilial
        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
        if (!cipa || !cipa.votacaoAtiva) return res.redirect('/cipa')
        const cipaEncerrada = await checkCipaVotes(codfilial, cipa.id)
        if (req.query.chapa) {
            const chapa = req.query.chapa
            /*
            const func = await mssqlStmtQuery(repository.mssql.funcionario(codfilial, req.query.chapa))
            func.forEach(func => func.IMAGEM = ConvertBufferAndReturnImageURL(func.IMAGEM))
            const [voto] = await mysqlPromise.query(...repository.mysql.checarVoto(cipa.id, req.query.chapa))
            */
            const [result] = await mysqlPromise.query(...repository.mysql.getApi(req.user.id_empresa))
            const api = result[0]
            if (!api) return res.redirect('/cipa')

            const [votos] = await mysqlPromise.query(...repository.mysql.getCipaVotos(cipa.id))
            const apiRequest = {
                url: `${api.url}/CI.001/1/P?parameters=CODFILIAL=${cipa.codfilial};CHAPA=${chapa}`,
                encodedUser: api.encoded_user
            }
            res.render('iniVotacao.ejs', {
                votos, chapa: req.query.chapa, message: req.flash(),
                apiUrl: apiRequest.url, apiUser: apiRequest.encodedUser
            })
        } else {
            res.render('iniVotacao.ejs', { message: req.flash() })
        }

    },

    postIniciarVotacao: async (req, res) => {
        console.log(req.body)
        const func = {
            codfilial: req.body.codfilial,
            chapa: req.body.chapa,
            nome: req.body.nome,
            secao: req.body.secao,
            funcao: req.body.funcao,
        }

        if (func.chapa == '') return res.redirect('back')

        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        const [votos] = await mysqlPromise.query(...repository.mysql.getCipaVotos(cipa.id))


        const voto = votos.find(voto => voto.chapa == func.chapa)
        if (!voto) {
            console.log(func)
            votante.func = func

            votante.cipaid = cipa.id
            console.log(votante)
            res.redirect('/votacao/' + votante.func.codfilial)
        } else {
            req.flash("error", "Funcionário não encontrado")
            res.redirect('/iniciar_votacao/' + req.params.codfilial)
        }


    },

    renderVotacao: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (votante.func && cipa) {
            const candidatos = await getCandidatos(cipa.id)

            for (let i = 0; i < candidatos.length; i++) {
                candidatos[i].imagem = await queryImageAndReturnURL(candidatos[i].idimagem)
            }

            res.render('votacao.ejs', { candidatos: candidatos, func: votante.func })
        } else {
            res.redirect('/cipa')
        }

    },

    postVotacao: (req, res) => {
        votante.nvotacao = req.body.nvotacao
        res.redirect(`/confirmar_voto/${req.params.codfilial}/${req.body.nvotacao}`)
    },

    renderConfirmarVoto: async (req, res) => {
        if (!votante.nvotacao) return res.redirect(`/iniciar_votacao/${req.params.codfilial}`)

        const [result] = await mysqlPromise.query(...repository.mysql.getApi(req.user.id_empresa))
        const api = result[0]
        if (!api) return res.redirect('/cipa')

        const apiRequest = {
            url: `${api.url}/CI.007/1/P?parameters=CODFILIAL=${req.params.codfilial};CHAPA=${votante.func.chapa};DIGITOS=`,
            encodedUser: api.encoded_user
        }

        if (votante.nvotacao === "BRA" || votante.nvotacao === "NUL") return res.render('confirmarVoto.ejs',
            {
                candidato: null, voto: votante.nvotacao === "BRA" ? "BRANCO" : "NULO", votante, message: req.flash(),
                apiUrl: apiRequest.url, apiUser: apiRequest.encodedUser
            })

        const candidatos = await getCandidatos(votante.cipaid)
        const candidato = candidatos.find(candidato => candidato.n_votacao === votante.nvotacao)
        console.log(votante)
        if (!candidato) return res.redirect('/cipa')

        candidato.imagem = await queryImageAndReturnURL(candidato.idimagem)
        res.render('confirmarVoto.ejs', { candidato, votante, message: req.flash(), apiUrl: apiRequest.url, apiUser: apiRequest.encodedUser })
    },

    putConfirmarVoto: async (req, res) => {
        if (!votante.func) return res.redirect('/cipa')
        const func = votante.func
        const [voto] = await mysqlPromise.query(...repository.mysql.checarVoto(votante.cipaid, func.chapa))
        if (voto[0]) {
            req.flash("error", "Funcionário já votou")
            return res.redirect(`/iniciar_votacao/${func.codfilial}`)
        }

        if (req.body.confirmacao == 1) {
            const candidatos = await getCandidatos(votante.cipaid)
            const candidato = candidatos.find(candidato => candidato.n_votacao === votante.nvotacao)
            const result = await mysqlPromise.query(...repository.mysql.addVoto(votante.cipaid, candidato ? candidato.n_votacao : votante.nvotacao))

            if (result[0].changedRows === 0) {
                req.flash("error", "Ocorreu um erro com seu voto.")
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                return res.redirect('back');
            }

            await mysqlPromise.query(...repository.mysql.registrarVoto(votante.cipaid, func.codcoligada, func.codfilial, func.chapa, func.nome, func.secao))
            req.flash("nome", func.nome)
            votante.func = null
            votante.nvotacao = null
            return res.redirect(`/voto_finalizado/${func.codfilial}`)
        } else {
            req.flash("error", "Os digitos inseridos estão incorretos")
            return res.redirect(`/confirmar_voto/${func.codfilial}/${votante.nvotacao}`)
        }
    },

    renderVotoFinalizado: (req, res) => {
        res.render('fimVoto.ejs', { gestao, message: req.flash() })
    }

}

module.exports = votacaoController;