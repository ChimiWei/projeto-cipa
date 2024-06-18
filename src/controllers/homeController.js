const mailRepo = require("../helpers/mail-repo")


const homeController = {
    renderHome: (req, res) => {
            
            res.render('home.ejs', {})
    },

    postMail: async (req, res) => {
        await mailRepo.budget(req.body.email)

        res.redirect('/')
    }
}


module.exports = homeController
