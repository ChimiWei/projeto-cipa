
function checkAuthenticated(req, res, next) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    
    if(req.user.verificado == 0) return res.redirect('/nao_verificado')
    
    if(req.user.id_role == 1) return res.redirect('/admin')

    
    return next()
    
}


module.exports = checkAuthenticated