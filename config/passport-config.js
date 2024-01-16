const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
const {getUserByEmail, getUserById } = require('../src/models/userModel')

function initialize(passport) {
    
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email)

        console.log(user)

        if (user == null) {
            return done(null, false, {message: 'Email não encontrado'})
            
        }

        try {
            if(await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Senha Incorreta' })
            }
        } catch (e) {
            return done(e)
        }

    }

    

    passport.use(new LocalStrategy({ usernameField: 'email'},
     authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => { 
        return done(null, getUserById(id))
    })


}

module.exports = initialize