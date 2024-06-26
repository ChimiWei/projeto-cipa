const mailRepo = require("../helpers/mail-repo")


const homeController = {
    renderHome: (req, res) => {
            
            res.render('home.ejs', {})
    },

    postMail: async (req, res) => {
        await mailRepo.budget(req.body.name, req.body.email)

        res.redirect('/#contact')
    }
}


module.exports = homeController
