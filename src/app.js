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


const mysqlPromise = mysql.promise()

const req = require('express/lib/request');


const ano = new Date().getFullYear()
const dia = new Date().getDate()
const mes = new Date().getMonth() + 1
const hoje = dia + '/' + mes + '/' + ano
const gestao = ano + '/' + (ano + 1)


var users = []

var cipas = []

var votante = {
    nvotacao: null,
    func: null
}

var candidatosAuth = false

const catchAsyncErr = (route) => {
    return async function (req, res, next) {
        try {
            await route(req, res, next)
        } catch (e) {
            console.log(e)
            next(e)
        }
    }
}

const mssqlQuery = async (query) => {
    const poolMssql = await mssql.getPool()
    const result = (await poolMssql.query(query)).recordset // retorna apenas o resultado da query
    return result
}


const checkCipaVotes = async (codfilial, cipaid) => {
    const result = await mssql.mssqlStmtQuery(repository.mssql.funcTotalFilial(codfilial))
    const [rows] = await mysqlPromise.query(...repository.mysql.getTotalVotos(cipaid))
    console.log(rows)

    const [filial] = result
    const [votos] = rows

    let percentage = Math.floor((votos.total * 100) / filial.total)

    console.log(percentage + '%')

}

function isTodayInRange(firstDate, lastDate) {
    const currentDate = new Date()
    //  console.log(`${formatDate(currentDate)} está entre ${formatDate(firstDate)} e ${formatDate(lastDate)}`)
    return (firstDate <= currentDate && currentDate <= lastDate)
}

function formatDate(date) {
    let formatedDate = ((date.getDate())) + "/" + ((date.getMonth() + 1)) + "/" + (date.getFullYear())

    return formatedDate
}

function generateToken() {
    let randomToken = Math.random().toString(36).slice(2, 8)
    console.log(randomToken)
    if (randomToken.length >= 6 && randomToken.search(/\d{1,3}/) != -1) return randomToken

    return generateToken()
}


const getCipaAtiva = async () => {
    const [rows, fields] = await mysqlPromise.query(`select * from cipaconfig where ativa=1`)

    rows.forEach((cipa) => {
        if (cipa.inscricaoAtiva === undefined) {
            const iniInsc = new Date(cipa.dtiniinsc.split('/').reverse())
            const fimInsc = new Date(cipa.dtfiminsc.split('/').reverse())
            const iniVoto = new Date(cipa.dtinivoto.split('/').reverse())
            const fimVoto = new Date(cipa.dtfimvoto.split('/').reverse())

            cipa.inscricaoAtiva = isTodayInRange(iniInsc, fimInsc)

            cipa.votacaoAtiva = isTodayInRange(iniVoto, fimVoto)

        }
    })

    cipas = await JSON.parse(JSON.stringify(rows))
    // console.log('cipa ativa:')


}

getCipaAtiva()


const getCandidatos = async (cipaid) => {
    if (!cipas) return // interrompe a função se não houver uma cipa ativa
    try {
        const [rows] = await mysqlPromise.query(...repository.mysql.candidatos(cipaid))
        return rows
    } catch (e) {
        console.log(e)
    }

}

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

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}


function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}



app.use(errorHandler)

app.listen((process.env.PORT || 3200), () => {
    console.log('Servidor está funcionando')
});