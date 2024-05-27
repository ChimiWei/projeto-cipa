const passport = require('passport')
const bcrypt = require('bcrypt')
const mysqlPromise = require('../helpers/mysqlQuery')

const userController = {
    renderLogin: (req, res) => {
        res.render('login.ejs', {message: req.flash()})

    },
    postLogin: passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }),

    renderRegister: (req, res) => {
        res.render('register.ejs')
    },

    postRegister: async (req, res) => {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            let sql = `INSERT INTO usuario VALUES (default, '${req.body.name}', '${req.body.email}', '${hashedPassword}', default, default, default)`
            mysqlPromise.query(sql)

            req.flash('notification', 'Usuário criado!')

            res.redirect('/login')
            /* const user = {
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword}
            
            users.push(user)
            */

        } catch (e) {
            console.log(e)
            res.redirect('/register')
        }


    },
    deleteLogout: (req, res) => {
        if(!req.isAuthenticated()) return res.redirect('/login')
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/login');
            });
   
    },
    renderNotVerificado: (req, res) => {
        res.render('notVerificado.ejs')
    }
}

module.exports = userController