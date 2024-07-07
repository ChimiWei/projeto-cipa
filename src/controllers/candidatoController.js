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
        
        const [result] = await mysqlPromise.query(...repository.mysql.getApi(req.user.id_empresa))
        const api = result[0]
        if(!api) return res.redirect('/cipa')

        if (req.query.chapa) {
            const chapa = req.query.chapa
            const apiRequest = {
                url: `${api.url}/CI.001/1/P?parameters=CODFILIAL=${cipa.codfilial};CHAPA=${chapa}`,
                encodedUser: api.encoded_user
            }
    
            // const candidatos = await getCandidatos(cipa.id)
            const candidatos = await getCandidatos(cipa.id)
            console.log(candidatos)
            
            res.render('addCandidato.ejs', { user: req.user, gestao: gestao, chapa: chapa, candidatos: candidatos, message: req.flash(),
                apiUrl: apiRequest.url, apiUser: apiRequest.encodedUser})
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
        if (candidatos.find(func => func.chapa === chapa)) return res.send('Funcionário já cadastrado!')
        const [rows] = await mysqlPromise.query(...repository.mysql.novoNumeroDeVotacao(cipa.id))
        const novoNVotacao = rows[0].novonvotacao ? rows[0].novonvotacao : '001'
        const [result] = await mysqlPromise.query(...repository.mysql.getApi(req.user.id_empresa))
        const api = result[0]
        if(!api) return res.redirect('/cipa')
        
        const apiRequest = {
            url: `${api.url}/CI.004/1/P?parameters=CODFILIAL=${cipa.codfilial};CHAPA=${chapa}`,
            encodedUser: api.encoded_user
        }
        res.render('fichaCandidato.ejs', { n_votacao: novoNVotacao, hoje, apiUrl: apiRequest.url, apiUser: apiRequest.encodedUser })
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