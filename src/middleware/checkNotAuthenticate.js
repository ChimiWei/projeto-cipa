
function checkNotAuthenticated(req, res, next) {
   /* if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next() */

    return next()
}



module.exports = checkNotAuthenticated