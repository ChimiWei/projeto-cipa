var { getCipaAtivaByUserId } = require('../models/cipaModel')
const { gestao } = require('../models/dateModel')

const homeController = {
     renderHome: 
        async (req, res) => {
            const cipas = await getCipaAtivaByUserId(req.user.id)
            
            res.render('home.ejs', { user: req.user, gestao: gestao, cipas: cipas })
        }
}


module.exports = homeController
