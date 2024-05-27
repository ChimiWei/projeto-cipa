const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
const { getUserByEmailOrLogin, getUserByEmail, getUserById } = require('../src/models/userModel')

function initialize(passport) {

    const authenticateUser = async (login, password, done) => {
        const user = await getUserByEmailOrLogin(login)

        console.log(user)

        if (user == null) {
            return done(null, false, { message: 'login não encontrado' })

        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Senha Incorreta' })
            }
        } catch (e) {
            return done(e)
        }

    }



    passport.use(new LocalStrategy({ usernameField: 'login' },
        authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id)
            return done(null, user)
        } catch (error) {
            return done(error)
        }

    })


}

module.exports = initialize