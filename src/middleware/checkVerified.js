function checkVerified(req, res, next) {
    if (!req.isAuthenticated()) return res.redirect('/login')

    if (req.user.verificado == 1) return res.redirect('/cipa')


    return next()


}


module.exports = checkVerified