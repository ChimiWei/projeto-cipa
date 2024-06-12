var { getCipaAtivaByUserId } = require('../models/cipaModel')
const { gestao } = require('../models/dateModel')

const cipaController = {
     renderCipa: 
        async (req, res) => {
            const cipa = await getCipaAtivaByUserId(req.user.id)
            
            res.render('cipa.ejs', { user: req.user, gestao: gestao, cipa: cipa[0] })
        }
}


module.exports = cipaController