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
const mysql = require('./db_connection');
const mssql = require('./db_connection_mssql')
const consulta = require('./query-repo')
const middleware = require('./middleware')

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

var cipaativa = []

var candidatos = []

var votante = {
    nvotacao: null,
    func: null
}

const catchAsyncErr = (middleware) => {
    return async function (req, res, next) {
        try {
            await middleware(req, res, next)
        } catch (err) {
            console.log(err)
            next(err)
        }
    }
}

const mssqlQuery = async (query) => {
    const poolMssql = await mssql.getPool()
    const result = (await poolMssql.query(query)).recordset // retorna apenas o resultado da query
    return result
}



const getUsers = async () => {
    const [rows, fields] = await promiseMysql.query(`select * from usuario`)
    users = await JSON.parse(JSON.stringify(rows))
    console.log('usuários no sistema:')
    console.log(users)
}

getUsers()


const getCipaAtiva = async () => {
    const [rows, fields] = await promiseMysql.query(`select * from cipaconfig where ativa=1`)
    cipaativa = await JSON.parse(JSON.stringify(rows))[0] // recebe a primeira linha 
    console.log('cipa ativa:')
    console.log(cipaativa)
    getCandidatos()

}

getCipaAtiva()


const getCandidatos = async () => {
    if (!cipaativa) return // interrompe a função se não houver uma cipa ativa
    try {
        const [rows] = await promiseMysql.query(`select n_votacao, chapa, votos_r, nome, funcao, secao from inscritos where cipaid = ${cipaativa.id}`)
        candidatos = await JSON.parse(JSON.stringify(rows))
        console.log('candidatos:')
        console.log(candidatos)
        return rows
    } catch (e) {
        console.log(e)
    }

}



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



app.get('/', /*checkAuthenticated,*/(req, res) => {
    res.render('cipaconfig.ejs', { user: req.user, gestao: gestao, cipa: cipaativa })
})

app.post('/cipaconfig', catchAsyncErr(async (req, res) => {
    if (cipaativa) return res.send('ja existe uma cipa ativa')
    try {
        await promiseMysql.query(consulta.cadastrarCipa(ano, req.body.inscricaoini, req.body.inscricaofim,
            req.body.votacaoini, req.body.votacaofim, req.body.resultado))
        console.log('cipa cadastrada com sucesso')
        getCipaAtiva()
        res.redirect('/')
    } catch (e) {
        res.send(e)
    }
}))


app.get('/cadastro_candidato', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    if (req.query.chapa) {
        const chapa = req.query.chapa
        const func = await mssql.safeQuery(consulta.funcionario(chapa)) //consulta o funcionário pela chapa
        const candidato = candidatos.find(func => func.chapa === chapa) // checa se o funcionário já está inscrito
        console.log(func)
        res.render('addCandidato.ejs', { user: req.user, gestao: gestao, func: func[0], chapa: chapa, candidato: candidato })
    } else {
        res.render('addCandidato.ejs', { user: req.user, gestao: gestao })
    }
}))

app.get('/fichaCandidato/:chapa', catchAsyncErr(async (req, res) => {
    const chapa = req.params.chapa
    if (candidatos.find(func => func.chapa === chapa)) res.send('Funcionário já cadastrado!')
    const [rows] = await promiseMysql.query(consulta.maxNVotacao())
    const maxNVotacao = rows[0].maxnvotacao ? rows[0].maxnvotacao : '001'
    console.log(maxNVotacao)
    const func = await mssql.safeQuery(consulta.funcComColigada(chapa))
    res.render('fichaCandidato.ejs', { func: func[0], n_votacao: maxNVotacao, hoje: hoje })

}))

app.post('/fichaCandidato', catchAsyncErr(async (req, res) => {

    await getCandidatos()
    const chapa = req.body.chapa
    const nvotacao = req.body.nvotacao
    if (candidatos.find(func => func.chapa === chapa)) res.send('Funcionário já cadastrado!')
    if (candidatos.find(func => func.n_votacao === nvotacao)) res.send('Número de votação já está em uso.')
    console.log(req.body)
    console.log(nvotacao)
    const query = consulta.cadastrarCandidato(cipaativa.id, req.body.chapa, nvotacao, req.body.nome, req.body.funcao, req.body.secao, ano)
    await promiseMysql.query(query.sql, query.params)
    res.redirect('/lista')


}))

app.get('/iniciar_votacao', async (req, res) => {
    res.render('iniVotacao.ejs')

})

app.post('/iniciar_votacao', catchAsyncErr(async (req, res) => {
    const func = await mssql.safeQuery(consulta.funcComCpf(req.body.chapa))
    votante.func = func[0]
    res.redirect('/votacao')

}))

app.get('/votacao', async (req, res) => {
    if (votante.func) {
        await getCandidatos()
        res.render('votacao.ejs', { candidatos: candidatos, func: votante.func })
    } else {
        res.redirect('/iniciar_votacao')
    }

})

app.post('/votacao', async (req, res) => {
    votante.nvotacao = req.body.nvotacao
    res.redirect('/confirmar_voto')
})

app.get('/confirmar_voto', catchAsyncErr(async (req, res) => {
    if (!votante.nvotacao) return res.redirect('/votacao')
    const candidato = candidatos.find(candidato => candidato.n_votacao === votante.nvotacao)
    console.log(votante.func.CHAPA)
    console.log(mysql.format(consulta.voto(candidato.votos_r, cipaativa.id, candidato.chapa, candidato.n_votacao)))
    res.render('confirmarVoto.ejs', { candidato, votante: votante.func, message: req.flash() })
}))

app.post('/confirmar_voto', catchAsyncErr(async (req, res) => {
    if (req.body.confirmacao == votante.func.CONFIRMACAO) {
        const candidato = candidatos.find(candidato => candidato.n_votacao === votante.nvotacao)

        await promiseMysql.query(...consulta.voto(candidato.votos_r, cipaativa.id, candidato.chapa, candidato.n_votacao))
        await promiseMysql.query(...consulta.registrarVoto(cipaativa.id, votante.func.CHAPA))
        votante.func = null
        votante.nvotacao = null
        return res.redirect('/lista')
    } else {
        req.flash("error", "Os digitos inseridos estão incorretos")
        return res.redirect('/confirmar_voto')
    }
}))




app.post('/solicitar_alteracao', catchAsyncErr(async (req, res) => {

    const cipaid = req.body.deletedcipaid
    await promiseMysql.query(consulta.deleteInscritos(cipaid))
    await promiseMysql.query(consulta.deleteCipa(cipaid))
    getCipaAtiva()
    res.redirect('/')

}))

app.get('/perfil', /*checkAuthenticated,*/(req, res) => {
    res.render('profile.ejs', { user: req.user })
})

app.get('/lista', /*checkAuthenticated,*/ async (req, res) => {
    await getCandidatos()
    res.render('listCandidato.ejs', { user: req.user, candidatos: candidatos })
})



app.get('/login', /*checkNotAuthenticated,*/(req, res) => {
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
            if (err) throw err;

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


function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}


app.use(middleware.errorHandler)

app.listen(3000, () => {
    console.log('Servidor está funcionando')
});