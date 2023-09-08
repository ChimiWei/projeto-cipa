if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const bcrypt = require('bcrypt')
const express = require('express')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const path = require('path')
const mysql = require('./db_connection');
const mssql = require('./db_connection_mssql')
const consulta = require('./query-repo')

const app = express();


app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use(express.static(path.join(__dirname, 'views/img')));



const initializePassport = require('./passport-config')
initializePassport(passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )


const promiseMysql = mysql.promise()

const req = require('express/lib/request');


const ano = new Date().getFullYear()
const dia = new Date().getDate()
const mes = new Date().getMonth()
const hoje = dia + '/' + mes + '/' + ano
const gestao = ano + '/' + (ano + 1)




var users = []

var cipaativa = [];

var candidatos = []

const mssqlQuery = async (query) => {
    const poolMssql = await mssql.getPool()
    const result = (await poolMssql.query(query)).recordset // retorna apenas o resultado da query
    return result
}


const getUsers = async () => {
    const [rows, fields] = await promiseMysql.query(`select * from usuario`)
    users = await JSON.parse(JSON.stringify(rows))
    console.log('usuários no sistema:')
    console.log(rows)
 }

 getUsers()


 const getCipaAtiva = async () => {
    const [rows, fields] = await promiseMysql.query(`select * from cipaconfig where ativa=1`)
    cipaativa = await JSON.parse(JSON.stringify(rows[0]))
    console.log('cipa ativa:')
    console.log(cipaativa.id)
    getCandidatos()
    
 }

 getCipaAtiva()


 const getCandidatos = async () => {
    try {
        const [rows, fields] = await promiseMysql.query(`select n_votacao, matricula, nome, funcao, secao from inscritos where cipaid = ${cipaativa.id}`)
        candidatos = await JSON.parse(JSON.stringify(rows))
        console.log('candidatos:')
        console.log(candidatos)
    } catch (e) {
        console.log(e)
    }
    
 }



app.use(express.urlencoded({ extended: false}))

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



app.get('/', /*checkAuthenticated,*/ (req, res) => {
    res.render('cipaconfig.ejs', {user: req.user, gestao: gestao, cipa: cipaativa})
})

app.post('/cipaconfig', async (req, res) => {
    if (cipaativa.length) return res.send('ja existe uma cipa ativa')
    try {
        let sql = `INSERT INTO cipaconfig VALUES 
        (default, default, '${ano}', '${req.body.inscricaoini}', '${req.body.inscricaofim}', '${req.body.votacaoini}', '${req.body.votacaofim}', '${req.body.resultado}', default)`
        await promiseMysql.query(sql)
        console.log('cipa cadastrada com sucesso')
        getCipaAtiva()
        res.redirect('/')
    } catch (e) {
        res.send(e)
    }
})


app.get('/cadastro_candidato', /*checkAuthenticated,*/ async (req, res) => {
    if(req.query.chapa) {
        const func = await mssqlQuery(consulta.funcionario(req.query.chapa)) //consulta o funcionário pela chapa
        console.log(func) 
        res.render('addCandidato.ejs', {user: req.user, gestao: gestao, func: func[0], chapa: req.query.chapa})
    } else {
    res.render('addCandidato.ejs', {user: req.user, gestao: gestao})
    }
})

app.get('/fichaCandidato/:chapa', async (req, res) => {
    const func = await mssqlQuery(consulta.funcComColigada(req.params.chapa))
    res.render('fichaCandidato.ejs', {func: func[0], hoje: hoje})
})

app.get('/votacao', async (req, res) => {
    res.render('votacao.ejs', {candidatos: candidatos})
})

app.post('/solicitar_alteracao', async (req, res) => {
    try {
        const cipaid = req.body.deletedcipaid
        let sql = `DELETE FROM cipaconfig WHERE id = '${cipaid}'`
        await promiseMysql.query(sql)
        getCipaAtiva()
        res.redirect('/')
    } catch(e) {
        res.send(e)
    }
})

app.get('/perfil', /*checkAuthenticated,*/ (req, res) => {
    res.render('profile.ejs', {user: req.user})
})

app.get('/lista', /*checkAuthenticated,*/ (req, res) => {
    res.render('listCandidato.ejs', {user: req.user, candidatos: candidatos})
})



app.get('/login', /*checkNotAuthenticated,*/ (req, res) => {
    res.render('login.ejs')
    
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))



app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})



app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let sql = `INSERT INTO usuario VALUES (default, '${req.body.name}', '${req.body.email}', '${hashedPassword}', default)`
        mysql.query(sql, (err) => {
            if(err) throw err;
           
        })
        /* const user = {
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword}
        
        users.push(user)
        */
        
    } catch {
        res.redirect('/register')
    }

    res.redirect('/login')
})


app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
   if (req.isAuthenticated()) {
       return next()
   }
  
 res.redirect('/login')
}


function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
       return res.redirect('/')
    }
    next()
}


app.listen(3000, () => {
    console.log('Servidor está funcionando')
});