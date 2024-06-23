const cookie = require('cookie')
const validateJWTAndReturnPayload = require('../helpers/validateJWTAndReturnPayload')

function AuthenticateTokenJWT(req, res, next) {
    const cookies = cookie.parse(req.headers.cookie || '')


    const payload = validateJWTAndReturnPayload(cookies.token)

    if (payload) {
        res.locals.token = payload.token
        return next()
    }

    return res.redirect('/cipa')
}


module.exports = AuthenticateTokenJWT