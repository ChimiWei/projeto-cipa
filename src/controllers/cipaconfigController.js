const { cipas, getCipaAtiva } = require('../models/cipaModel')
const { ano, gestao } = require('../models/dateModel')
const promiseMysql = require('../helpers/promiseMysql')
const db = require('../helpers/query-repo')

const cipaconfigController = {

    renderCipaConfig: async (req, res) => {
        const filiais = await mssqlQuery('select codcoligada, codfilial, nome from gfilial where codcoligada = 1')
        res.render('cipaconfig.ejs', { user: req.user, gestao: gestao, filiais: filiais, cipas: cipas, message: req.flash() })
    },

    postCipaConfig: async (req, res) => {
        const [codfilial, filial] = req.body.filial.split(',')
        const codcoligada = 1
        const fimIns = new Date(req.body.fiminscricao.split('/').reverse().join('/')) // reverse na data para o js reconhecer o mês corretamente
        const iniVoto = new Date(req.body.inivotacao.split('/').reverse().join('/'))
        const fimVoto = new Date(req.body.fimvotacao.split('/').reverse().join('/'))
        const resultado = new Date(req.body.resultado.split('/').reverse().join('/'))
        if (fimIns > iniVoto) {
            req.flash('error', 'data final da inscrição não pode ser maior que a data inicial da votação')
            return res.redirect('/')
        }
        if (fimVoto > resultado) {
            req.flash('error', 'data final da votação não pode ser maior que a data do resultado')
            return res.redirect('/')
        }
        await promiseMysql.query(...db.mysql.cadastrarCipa(codcoligada, codfilial, filial, ano, req.body.inscricaoini, req.body.fiminscricao,
            req.body.inivotacao, req.body.fimvotacao, req.body.resultado))
        
        await getCipaAtiva()
    
        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
    
        if(cipa) {
            await promiseMysql.query(...db.mysql.addToken(cipa.id, codcoligada, codfilial, generateToken()))
            await promiseMysql.query(...db.mysql.cadastrarVoto(cipa.id, "BRA"))
            await promiseMysql.query(...db.mysql.cadastrarVoto(cipa.id, "NUL"))
        } else {
            return res.send("ocorreu um erro")
        }
        
        console.log('cipa cadastrada com sucesso')
        res.redirect('/')
    }
}

module.exports = cipaconfigController