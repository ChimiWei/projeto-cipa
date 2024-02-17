const passport = require('passport')
const bcrypt = require('bcrypt')


const userController = {
    renderLogin: (req, res) => {
        res.render('login.ejs')
    
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
            mysql.query(sql, (err) => {
                if (err) throw err;
    
            })
            /* const user = {
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword}
            
            users.push(user)
            */
    
        } catch {
            res.redirect('/register')
        }
    
        res.redirect('/login')
    },
    deleteLogout: (req, res) => {
        req.logOut()
        res.redirect('/login')
    }
}

module.exports = userController