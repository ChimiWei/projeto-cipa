const { getCipaAtiva } = require('../models/cipaModel')
const { ano, gestao } = require('../models/dateModel')
const mysqlPromise = require('../helpers/mysqlQuery')
const repository = require('../helpers/query-repo')

const generateToken = require('../helpers/generateToken')
const generateJWT = require('../helpers/generateJWT')
const cookie = require('cookie')

const cipaconfigController = {

    renderCipaConfig: async (req, res) => {
        const cipas = await getCipaAtiva()

        const [result] = await mysqlPromise.query(...repository.mysql.getApi(req.user.id_empresa))
        const api = result[0]
        if(!api) return res.redirect('/cipa')
        
        const apiRequest = {
            url: `${api.url}/CI.002/1/P`,
            encodedUser: api.encoded_user
        }

        res.render('cipaconfig.ejs', { user: req.user, gestao: gestao, cipas: cipas, message: req.flash(), apiRequest})
    },

    postCipaConfig: async (req, res) => {
        const [codfilial, filial] = req.body.filial.split(',')
        const codcoligada = 1
        const fimIns = new Date(req.body.fiminscricao.split('/').reverse().join('/')) // reverse na data para o js reconhecer o mês corretamente
        const iniVoto = new Date(req.body.inivotacao.split('/').reverse().join('/'))
        const fimVoto = new Date(req.body.fimvotacao.split('/').reverse().join('/'))
        const resultado = new Date(req.body.resultado.split('/').reverse().join('/'))
        const user = req.user

        if (fimIns > iniVoto) {
            req.flash('error', 'data final da inscrição não pode ser maior que a data inicial da votação')
            return res.redirect('/cipaconfig')
        }
        if (fimVoto > resultado) {
            req.flash('error', 'data final da votação não pode ser maior que a data do resultado')
            return res.redirect('/cipaconfig')
        }
        const token = generateToken()

        await mysqlPromise.query(...repository.mysql.cadastrarCipa(codcoligada, codfilial, filial, ano, req.body.inscricaoini, req.body.fiminscricao,
            req.body.inivotacao, req.body.fimvotacao, req.body.resultado, user.id, user.id_empresa))

        const cipas = await getCipaAtiva()

        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)

        if (cipa) {
            await mysqlPromise.query(...repository.mysql.addToken(cipa.id, codcoligada, codfilial, token))
            await mysqlPromise.query(...repository.mysql.cadastrarVoto(cipa.id, "BRA"))
            await mysqlPromise.query(...repository.mysql.cadastrarVoto(cipa.id, "NUL"))
        } else {
            return res.send("ocorreu um erro")
        }


        const tokenJWT = generateJWT({ token: token }, '1h')
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
        if (!cipa) return res.redirect('/cipa')
        res.render('editCipa.ejs', { user: req.user, gestao: gestao, cipa, message: req.flash() })
    },

    putCipaConfigEdit: async (req, res) => {
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        if (!cipa) return res.redirect('/cipa')

        const [rows] = await mysqlPromise.query(...repository.mysql.getCipaToken(cipa.id))
        const { token } = rows[0]

        if (token != req.body.token) {
            req.flash('error', 'Token Incorreto')
            req.flash('date', req.body.fimvotacao)
            return res.redirect('back')

        }
        const [result] = await mysqlPromise.query(...repository.mysql.editCipa(req.body.fimvotacao, cipa.id))
        console.log(result)

        if (result.affectedRows === 0) {
            req.flash('error', 'Não foi possível atualizar a data')
            return res.redirect(`/edit_cipa/${cipa.codfilial}`)
        }

        req.flash('notification', 'Data alterada com sucesso')

        return res.redirect('/cipa')

    }
}

module.exports = cipaconfigController