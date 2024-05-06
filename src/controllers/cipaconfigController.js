const { getCipaAtiva } = require('../models/cipaModel')
const { ano, gestao } = require('../models/dateModel')
const mysqlPromise = require('../helpers/mysqlQuery')
const repository = require('../helpers/query-repo')
const { mssqlQuery } = require('../helpers/mssqlQuery')
const generateToken = require('../helpers/generateToken')
const generateJWT = require('../helpers/generateJWT')
const cookie = require('cookie')

const cipaconfigController = {

    renderCipaConfig: async (req, res) => {
        const cipas = await getCipaAtiva()
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
        const token = generateToken()
        await mysqlPromise.query(...repository.mysql.cadastrarCipa(codcoligada, codfilial, filial, ano, req.body.inscricaoini, req.body.fiminscricao,
            req.body.inivotacao, req.body.fimvotacao, req.body.resultado))

        const cipas = await getCipaAtiva()

        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)

        if (cipa) {
            await mysqlPromise.query(...repository.mysql.addToken(cipa.id, codcoligada, codfilial, token))
            await mysqlPromise.query(...repository.mysql.cadastrarVoto(cipa.id, "BRA"))
            await mysqlPromise.query(...repository.mysql.cadastrarVoto(cipa.id, "NUL"))
        } else {
            return res.send("ocorreu um erro")
        }

        console.log('cipa cadastrada com sucesso')

        const tokenJWT = generateJWT({ token: token })
        const serialized = cookie.serialize('token', tokenJWT, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60
            })
        
        res.setHeader('Set-Cookie', serialized)
        res.redirect('/cipatoken')
    },

    renderCipaConfigEdit: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa) return res.redirect('/')
        res.render('editCipa.ejs', { user: req.user, gestao: gestao, cipa, message: req.flash() })
    },

    putCipaConfigEdit: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa) return res.redirect('/')

        const [result] = await mysqlPromise.query(...repository.mysql.editCipa(req.body.fimvotacao, cipa.id))
        console.log(result)

        if (result.affectedRows === 0) {
            return res.redirect(`/edit_cipa/<%= cipa.codfilial %>`)
        }

        return res.redirect('/')

    }
}

module.exports = cipaconfigController