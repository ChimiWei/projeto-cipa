const { getCipaAtiva } = require('../models/cipaModel')
const votante = require('../models/votanteModel')
const repository = require('../helpers/query-repo')
const mysqlPromise = require('../helpers/mysqlQuery')
const { gestao, hoje, ano } = require('../models/dateModel')
const { mssqlStmtQuery } = require('../helpers/mssqlQuery')
const getCandidatos = require('../helpers/getCandidatos')
const checkCipaVotes = require('../helpers/checkCipaVotes')
const ConvertBufferAndReturnImageURL = require('../helpers/convertBufferAndReturnImage')


const votacaoController = {
    renderIniciarVotacao: async (req, res) => {
        const cipas = await getCipaAtiva()
        const codfilial = req.params.codfilial
        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
        if (!cipa || !cipa.votacaoAtiva) return res.redirect('/')
        const cipaEncerrada = await checkCipaVotes(codfilial, cipa.id)
        if (req.query.chapa) {
            const func = await mssqlStmtQuery(repository.mssql.funcionario(codfilial, req.query.chapa))
            func.forEach( func => func.IMAGEM = ConvertBufferAndReturnImageURL(func.IMAGEM))
            const [voto] = await mysqlPromise.query(...repository.mysql.checarVoto(cipa.id, req.query.chapa))

            res.render('iniVotacao.ejs', { func: func[0], voto: voto[0], chapa: req.query.chapa, message: req.flash() })
        } else {
            res.render('iniVotacao.ejs', { message: req.flash() })
        }

    },

    postIniciarVotacao: async (req, res) => {
        const cipas = await getCipaAtiva()
        const func = await mssqlStmtQuery(repository.mssql.funcComCpf(req.body.chapa, req.params.codfilial))
        if (func.length != 0) {
            console.log(func)
            votante.func = func[0]
            const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
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
            res.render('votacao.ejs', { candidatos: candidatos, func: votante.func })
        } else {
            res.redirect('/')
        }

    },

    postVotacao: (req, res) => {
        votante.nvotacao = req.body.nvotacao
        res.redirect(`/confirmar_voto/${req.params.codfilial}/${req.body.nvotacao}`)
    },

    renderConfirmarVoto: async (req, res) => {
        if (!votante.nvotacao) return res.redirect('/')
        if (votante.nvotacao === "BRA" || votante.nvotacao === "NUL") return res.render('confirmarVoto.ejs',
            { candidato: null, voto: votante.nvotacao === "BRA" ? "BRANCO" : "NULO", votante, message: req.flash() })

        const candidatos = await getCandidatos(votante.cipaid)
        const candidato = candidatos.find(candidato => candidato.n_votacao === votante.nvotacao)
        console.log(votante)

        if (!candidato) return res.redirect('/')
        res.render('confirmarVoto.ejs', { candidato, votante, message: req.flash() })
    },

    putConfirmarVoto: async (req, res) => {
        if (!votante.func) return res.redirect('/')
        const func = votante.func
        const [voto] = await mysqlPromise.query(...repository.mysql.checarVoto(votante.cipaid, func.chapa))
        if (voto[0]) {
            req.flash("error", "Funcionário já votou")
            return res.redirect(`/iniciar_votacao/${func.codfilial}`)
        }
        if (req.body.confirmacao == votante.func.confirmacao) {
            const candidatos = await getCandidatos(votante.cipaid)
            const candidato = candidatos.find(candidato => candidato.n_votacao === votante.nvotacao)
            const result = await mysqlPromise.query(...repository.mysql.addVoto(votante.cipaid, candidato ? candidato.n_votacao : votante.nvotacao))

            console.log('Resultado:')
            console.log(result[0])

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