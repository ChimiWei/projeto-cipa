function checkAdmin(req, res, next) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    
    if(req.user.admin == 0) return res.redirect('/')
         
    
    return next()
 
     
 }
 
 
 module.exports = checkAdmin