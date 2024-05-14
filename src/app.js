if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const bcrypt = require('bcrypt')
const express = require('express')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const path = require('path')
const mysql = require('../config/db_connection_mysql');
const mssql = require('../config/db_connection_mssql')
const repository = require('./helpers/query-repo')
const errorHandler = require('./middleware/errorHandler')

const Routes = require('./routes/Routes')


const app = express();


app.use(express.static('public'))
app.use('/css', express.static('../public/css'))
app.use('/js', express.static('../public/js'))
app.use('/img', express.static('../public/img'))
// app.use(express.static(path.join(__dirname, '/public/img')))
app.set('views', 'public/views');
//console.log(__dirname)

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.engine('html', require('ejs').renderFile);



const initializePassport = require('../config/passport-config')

initializePassport(passport)


app.use('/', Routes)


/*
app.delete('/suspender_cipa/:codfilial', /*checkAuthenticated, <////>catchAsyncErr(async (req, res) => {
    const codfilial = req.params.codfilial
    const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
    if (!cipa) return res.redirect('/')
    
    const [rows] = await mysqlPromise.query(...repository.mysql.getCipaToken(cipa.id, codfilial))
    const {token} = rows[0]
    
    if(req.body.token === token) {
        const cipaid = cipa.id
        console.log('cipa id:')
        console.log(cipaid)
        await mysqlPromise.query(...repository.mysql.deleteRegistroVoto(cipaid))
        await mysqlPromise.query(...repository.mysql.deleteVoto(cipaid))
        await mysqlPromise.query(...repository.mysql.deleteInscritos(cipaid))
        await mysqlPromise.query(...repository.mysql.deleteToken(cipaid))
        await mysqlPromise.query(...repository.mysql.deleteCipa(cipaid))
        
        getCipaAtiva()

        return res.redirect('/')
    } else {
        req.flash("error", "Token Incorreto")
        return res.redirect(`/suspender_cipa/${codfilial}`)
    }
}))

app.delete('/solicitar_alteracao/:cipaid', catchAsyncErr(async (req, res) => {
    if(!deleteAuth) return res.redirect('/')
    
    const cipaid = req.params.cipaid

    await mysqlPromise.query(...repository.mysql.deleteRegistroVoto(cipaid))
    await mysqlPromise.query(...repository.mysql.deleteVoto(cipaid))
    await mysqlPromise.query(...repository.mysql.deleteInscritos(cipaid))
    await mysqlPromise.query(...repository.mysql.deleteCipa(cipaid))
    
    getCipaAtiva()

    deleteAuth = false

    res.redirect('/')

}))
*/


app.get('/perfil', /*checkAuthenticated,*/(req, res) => {
    res.render('profile.ejs', { user: req.user })
})


app.use(errorHandler)

app.listen((process.env.PORT || 3200), () => {
    console.log('Servidor está funcionando')
});