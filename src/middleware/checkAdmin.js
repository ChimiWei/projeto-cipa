function checkAdmin(req, res, next) {
    if (!req.isAuthenticated()) return res.redirect('/login')

    if (req.user.id_role != 1) return res.redirect('/cipa')


    return next()


}


module.exports = checkAdmin