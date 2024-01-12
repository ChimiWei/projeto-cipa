const { getCipaAtiva } = require("../models/cipaModel")
const db = require('../helpers/query-repo')
const mysqlPromise = require('../helpers/mysqlQuery')


const suspendercipaController = {
    renderSuspenderCipa: (req, res) => {

        res.render('autorizarEncerramento.ejs', { codfilial: req.params.codfilial, message: req.flash() })
    },
    putSuspenderCipa: async (req, res) => {
        const codfilial = req.params.codfilial
        const cipas = await getCipaAtiva()
        const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
        if (!cipa) return res.redirect('/')

        const [rows] = await mysqlPromise.query(...db.mysql.getCipaToken(cipa.id, codfilial))
        const { token } = rows[0]

        if (req.body.token === token) {
            const cipaid = cipa.id
            console.log('cipa id:')
            console.log(cipaid)
            await mysqlPromise.query(...db.mysql.suspendCipa(cipaid))


            await getCipaAtiva()

            return res.redirect('/')
        } else {
            req.flash("error", "Token Incorreto")
            return res.redirect(`/suspender_cipa/${codfilial}`)
        }
    },
}

module.exports = suspendercipaController