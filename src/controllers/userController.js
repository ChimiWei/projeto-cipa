const passport = require('passport')
const bcrypt = require('bcrypt')
const mysqlPromise = require('../helpers/mysqlQuery')
const repository = require('../helpers/query-repo')
const { getUserByEmailOrLogin } = require('../models/userModel')

const userController = {
    renderLogin: (req, res) => {
        res.render('login.ejs', { message: req.flash() })

    },
    postLogin: passport.authenticate('local', {
        successRedirect: '/cipa',
        failureRedirect: '/login',
        failureFlash: true
    }),

    renderRegister: (req, res) => {
        const message = req.flash()
        res.render('register.ejs', {error: message.error, form: message.form ? message.form[0] : null})
    },

    postRegister: async (req, res) => {
        const form = {
            login: req.body.login,
            email: req.body.email
        }
        req.flash('form', form)

        const userByLogin = await getUserByEmailOrLogin(req.body.login)

        const userByEmail = await getUserByEmailOrLogin(req.body.email)

        if(userByLogin || userByEmail) {
            
            req.flash('error', 'Nome de Usuário ou Email indisponível')
            return res.redirect('back')
        }

        const [rows, fields] = await mysqlPromise.query(...repository.mysql.getConviteToken(req.body.convitetoken))
        const token = rows[0]
            
        if(!token || token.used == 1) {
            
            req.flash('error', 'Token inválido')
            return res.redirect('back')
        }

            
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let sql = `INSERT INTO usuario VALUES (default, '${req.body.login}', '${req.body.email}', '${hashedPassword}', default, ${token.id_empresa}, 3, default, default)`
        mysqlPromise.query(sql)

        req.flash('notification', 'Usuário criado!')

        res.redirect('/login')

    },
    deleteLogout: (req, res) => {
        if (!req.isAuthenticated()) return res.redirect('/login')
        req.logout(function (err) {
            if (err) { return next(err); }
            res.redirect('/login');
        });

    },
    renderNotVerificado: (req, res) => {
        res.render('notVerificado.ejs')
    }
}

module.exports = userController