
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/cipa')
    }

    return next()
}



module.exports = checkNotAuthenticated