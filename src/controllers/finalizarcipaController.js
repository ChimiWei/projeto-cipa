const { getCipaAtiva } = require("../models/cipaModel")
const repository = require('../helpers/query-repo')
const mysqlPromise = require('../helpers/mysqlQuery')


const finalizarcipaController = {
    getFinalizarCipa: (req, res) => {

        res.render('autorizarEncerramento.ejs', { codfilial: req.params.codfilial, message: req.flash() })
    },
    putFinalizarCipa: async (req, res) => {
        const codfilial = req.params.codfilial
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
        if (!cipa) return res.redirect('/cipa')

        const [rows] = await mysqlPromise.query(...repository.mysql.getCipaToken(cipa.id))
        const { token } = rows[0]

        if (req.body.token === token) {
            const cipaid = cipa.id
           
            await mysqlPromise.query(...repository.mysql.suspendCipa(cipaid))


            await getCipaAtiva()

            return res.redirect('/cipa')
        } else {
            req.flash("error", "Token Incorreto")
            return res.redirect(`/autorizar_finalizar/${codfilial}`)
        }
    },
}

module.exports = finalizarcipaController