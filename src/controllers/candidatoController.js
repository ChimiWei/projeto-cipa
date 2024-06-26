const { getCipaAtiva } = require('../models/cipaModel')
const repository = require('../helpers/query-repo')
const mysqlPromise = require('../helpers/mysqlQuery')
const { gestao, hoje, ano } = require('../models/dateModel')
const { mssqlStmtQuery } = require('../helpers/mssqlQuery')
const getCandidatos = require('../helpers/getCandidatos')

const ConvertBufferAndReturnImageURL = require('../helpers/convertBufferAndReturnImage')

const candidatoController = {
    renderCadastroCandidato: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa || !cipa.inscricaoAtiva) return res.redirect('/cipa')

        if (req.query.chapa) {
            const chapa = req.query.chapa
            const func = await mssqlStmtQuery(repository.mssql.funcionario(req.params.codfilial, chapa)) //procura o funcionário pela chapa
            const candidatos = await getCandidatos(cipa.id)
            console.log(candidatos)
            func.forEach(func => func.IMAGEM = ConvertBufferAndReturnImageURL(func.IMAGEM))
            const candidato = candidatos.find(func => func.chapa === chapa) // checa se o funcionário já está inscrito
            res.render('addCandidato.ejs', { user: req.user, gestao: gestao, func: func[0], chapa: chapa, candidato: candidato, message: req.flash() })
        } else {
            res.render('addCandidato.ejs', { user: req.user, gestao: gestao, message: req.flash() })
        }
    },
    renderFichaCandidato: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa || !cipa.inscricaoAtiva) return res.redirect('/cipa')
        const candidatos = await getCandidatos(cipa.id)
        const chapa = req.params.chapa
        if (candidatos.find(func => func.chapa === chapa)) res.send('Funcionário já cadastrado!')
        const [rows] = await mysqlPromise.query(...repository.mysql.novoNumeroDeVotacao(cipa.id))
        const novoNVotacao = rows[0].novonvotacao ? rows[0].novonvotacao : '001'
        const func = await mssqlStmtQuery(repository.mssql.funcComColigada(req.params.codfilial, chapa))
        res.render('fichaCandidato.ejs', { func: func[0], n_votacao: novoNVotacao, hoje })
    },
    putFichaCandidato: async (req, res) => {
        const cipas = await getCipaAtiva()
        const codfilial = req.body.codfilial
        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
        const candidatos = await getCandidatos(cipa.id)
        const chapa = req.body.chapa
        if (!cipa || candidatos.find(func => func.chapa === chapa)) return res.redirect('/cipa')
        const nvotacao = req.body.nvotacao
        if (candidatos.find(func => func.chapa === chapa)) res.send('Funcionário já cadastrado!')
        if (candidatos.find(func => func.n_votacao === nvotacao)) res.send('Número de votação já está em uso.')
        console.log(req.body)
        console.log(nvotacao)


        await mysqlPromise.query(...repository.mysql.cadastrarCandidato(cipa.id, nvotacao, req.body.codcoligada,
            codfilial, chapa, req.body.nome, req.body.funcao, req.body.secao, req.body.idimagem, ano))

        await mysqlPromise.query(...repository.mysql.cadastrarVoto(cipa.id, nvotacao))

        req.flash('notification', 'Candidato cadastrado com sucesso')
        res.redirect('/cadastro_candidato/' + codfilial)
    }

}

module.exports = candidatoController