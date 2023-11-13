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
const db = require('./query-repo')
const middleware = require('./middleware')

const app = express();


app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use(express.static(path.join(__dirname, 'views/img')))

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



const initializePassport = require('./passport-config')
initializePassport(passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)


const promiseMysql = mysql.promise()

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

const catchAsyncErr = (middleware) => {
    return async function (req, res, next) {
        try {
            await middleware(req, res, next)
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



const getUsers = async () => {
    const [rows, fields] = await promiseMysql.query(`select * from usuario`)
    users = await JSON.parse(JSON.stringify(rows))
    // console.log('usuários no sistema:')
    // console.log(users)
}

getUsers()


const getCipaAtiva = async () => {
    const [rows, fields] = await promiseMysql.query(`select * from cipaconfig where ativa=1`)
    cipas = await JSON.parse(JSON.stringify(rows))
    // console.log('cipa ativa:')
    console.log(cipas)

}

getCipaAtiva()


const getCandidatos = async (cipaid) => {
    if (!cipas) return // interrompe a função se não houver uma cipa ativa
    try {
        const [rows] = await promiseMysql.query(...db.mysql.candidatos(cipaid))
        return rows
    } catch (e) {
        console.log(e)
    }

}

app.get('/', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    res.render('home.ejs', { user: req.user, gestao: gestao, cipas: cipas })
}))

app.post('/', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {

}))

app.get('/cipaconfig', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    const filiais = await mssqlQuery('select codfilial, nome from gfilial where codcoligada = 1')
    res.render('cipaconfig.ejs', { user: req.user, gestao: gestao, filiais: filiais, cipas: cipas, message: req.flash() })
}))

app.post('/cipaconfig', catchAsyncErr(async (req, res) => {
    const [codfilial, filial] = req.body.filial.split(',')
    const fimIns = new Date(req.body.fiminscricao.split('/').reverse().join('/')) // reverse na data para o js reconhecer o mês corretamente
    const iniVoto = new Date(req.body.inivotacao.split('/').reverse().join('/'))
    const fimVoto = new Date(req.body.fimvotacao.split('/').reverse().join('/'))
    const resultado = new Date(req.body.resultado.split('/').reverse().join('/'))
    if (fimIns > iniVoto) {
        req.flash('error', 'data final da inscrição não pode ser maior que a data inicial da votação')
        return res.redirect('/')
    }
    if (fimVoto > resultado) {
        req.flash('error', 'data final da votação não pode ser maior que a data do resultado')
        return res.redirect('/')
    }
    await promiseMysql.query(...db.mysql.cadastrarCipa(codfilial, filial, ano, req.body.inscricaoini, req.body.fiminscricao,
        req.body.inivotacao, req.body.fimvotacao, req.body.resultado))
    
    await getCipaAtiva()

    const cipa = cipas.find(cipa => cipa.codfilial == codfilial)

    if(cipa) {
        await promiseMysql.query(...db.mysql.cadastrarVoto(cipa.id, "BRA"))
        await promiseMysql.query(...db.mysql.cadastrarVoto(cipa.id, "NUL"))
    } else {
        return res.send("ocorreu um erro")
    }
    
    console.log('cipa cadastrada com sucesso')
    res.redirect('/')
}))


app.get('/cadastro_candidato/:codfilial', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
    if (!cipa) return res.redirect('/')
    if (req.query.chapa) {
        const chapa = req.query.chapa
        const func = await mssql.safeQuery(db.mssql.funcionario(req.params.codfilial, chapa)) //procura o funcionário pela chapa
        const candidatos = await getCandidatos(cipa.id)
        const candidato = candidatos.find(func => func.chapa === chapa) // checa se o funcionário já está inscrito
        res.render('addCandidato.ejs', { user: req.user, gestao: gestao, func: func[0], chapa: chapa, candidato: candidato })
    } else {
        res.render('addCandidato.ejs', { user: req.user, gestao: gestao })
    }
}))

app.get('/fichaCandidato/:codfilial/:chapa', catchAsyncErr(async (req, res) => {
    const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
    if (!cipa) return res.redirect('/')
    const candidatos = await getCandidatos(cipa.id)
    const chapa = req.params.chapa
    if (candidatos.find(func => func.chapa === chapa)) res.send('Funcionário já cadastrado!')
    const [rows] = await promiseMysql.query(db.mysql.maxNVotacao())
    const maxNVotacao = rows[0].maxnvotacao ? rows[0].maxnvotacao : '001'
    const func = await mssql.safeQuery(db.mssql.funcComColigada(req.params.codfilial, chapa))
    res.render('fichaCandidato.ejs', { func: func[0], n_votacao: maxNVotacao, hoje })

}))

app.post('/fichaCandidato', catchAsyncErr(async (req, res) => {
    const codfilial = req.body.codfilial
    const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
    const candidatos = await getCandidatos(cipa.id)
    const chapa = req.body.chapa
    if (!cipa || candidatos.find(func => func.chapa === chapa)) return res.redirect('/')
    const nvotacao = req.body.nvotacao
    if (candidatos.find(func => func.chapa === chapa)) res.send('Funcionário já cadastrado!')
    if (candidatos.find(func => func.n_votacao === nvotacao)) res.send('Número de votação já está em uso.')
    console.log(req.body)
    console.log(nvotacao)
    await promiseMysql.query(...db.mysql.cadastrarCandidato(cipa.id, nvotacao, codfilial, chapa, req.body.nome, req.body.funcao, req.body.secao, ano))
    await promiseMysql.query(...db.mysql.cadastrarVoto(cipa.id, nvotacao))
    res.redirect('/candidatos/' + codfilial)
}))

app.get('/iniciar_votacao/:codfilial', catchAsyncErr(async (req, res) => {
    const codfilial = req.params.codfilial
    const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
    if (!cipa) return res.redirect('/')
    if (req.query.chapa) {
        const func = await mssql.safeQuery(db.mssql.funcionario(codfilial, req.query.chapa))
        const [voto] = await promiseMysql.query(...db.mysql.checarVoto(cipa.id, req.query.chapa))

        res.render('iniVotacao.ejs', { func: func[0], voto: voto[0], chapa: req.query.chapa, message: req.flash() })
    } else {
        res.render('iniVotacao.ejs', { message: req.flash() })
    }


}))

app.post('/iniciar_votacao/:codfilial', catchAsyncErr(async (req, res) => {
    const func = await mssql.safeQuery(db.mssql.funcComCpf(req.body.chapa, req.params.codfilial))
    if(func.length != 0) {
        console.log(func)
        votante.func = func[0]
        const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
        votante.cipaid = cipa.id 
        res.redirect('/votacao/' + votante.func.codfilial)   
    } else {
        req.flash("error", "Funcionário não encontrado")
        res.redirect('/iniciar_votacao/' + req.params.codfilial)
    }
    

}))

app.get('/votacao/:codfilial', async (req, res) => {
    const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
    if (votante.func && cipa) {
        const candidatos = await getCandidatos(cipa.id)
        res.render('votacao.ejs', { candidatos: candidatos, func: votante.func })
    } else {
        res.redirect('/')
    }

})

app.post('/votacao/:codfilial', async (req, res) => {
    votante.nvotacao = req.body.nvotacao
    res.redirect(`/confirmar_voto/${req.params.codfilial}/${req.body.nvotacao}`)
})

app.get('/confirmar_voto/:codfilial/:nvotacao', catchAsyncErr(async (req, res) => {
    if (!votante.nvotacao) return res.redirect('/')
    if (votante.nvotacao === "BRA" || votante.nvotacao === "NUL") return res.render('confirmarVoto.ejs', 
    { candidato: null, voto: votante.nvotacao === "BRA" ? "BRANCO" : "NULO", votante, message: req.flash() })

    const candidatos = await getCandidatos(votante.cipaid)
    const candidato = candidatos.find(candidato => candidato.n_votacao === votante.nvotacao)
    console.log(votante)

    if(!candidato) return res.redirect('/')
    res.render('confirmarVoto.ejs', { candidato, votante, message: req.flash() })
}))

app.put('/confirmar_voto/:nvotacao', catchAsyncErr(async (req, res) => {
    if (req.body.confirmacao == votante.func.confirmacao) {
        const func = votante.func
        const candidatos = await getCandidatos(votante.cipaid)
        const candidato = candidatos.find(candidato => candidato.n_votacao === votante.nvotacao)
        const result = await promiseMysql.query(...db.mysql.addVoto(votante.cipaid, candidato ? candidato.n_votacao : votante.nvotacao))

        console.log('Resultado:')
        console.log(result[0])

        if(result[0].affectedRows === 0) {
            req.flash("error", "Ocorreu um erro com seu voto.")
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            return res.redirect('back');
        }

        await promiseMysql.query(...db.mysql.registrarVoto(votante.cipaid, func.codfilial, func.chapa, func.nome, func.secao))
        req.flash("nome", func.nome)
        votante.func = null
        votante.nvotacao = null
        return res.redirect(`/iniciar_votacao/${func.codfilial}`)
    } else {
        req.flash("error", "Os digitos inseridos estão incorretos")
        return res.redirect('/confirmar_voto')
    }
}))




app.delete('/solicitar_alteracao', catchAsyncErr(async (req, res) => {

    const cipaid = req.body.deletedcipaid

    await promiseMysql.query(...db.mysql.deleteRegistroVoto(cipaid))
    await promiseMysql.query(...db.mysql.deleteVoto(cipaid))
    await promiseMysql.query(...db.mysql.deleteInscritos(cipaid))
    await promiseMysql.query(...db.mysql.deleteCipa(cipaid))
    
    getCipaAtiva()
    res.redirect('/')

}))

app.get('/perfil', /*checkAuthenticated,*/(req, res) => {
    res.render('profile.ejs', { user: req.user })
})

app.get('/candidatos/:codfilial', /*checkAuthenticated,*/ async (req, res) => {
    const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
    if (!cipa) return res.redirect('/')
    const candidatos = await getCandidatos(cipa.id)
    const [rows] = await promiseMysql.query(...db.mysql.getVotos(cipa.id))
    const [branco, nulo] = rows
    console.log(branco)
    res.render('listCandidato.ejs', { user: req.user, candidatos: candidatos, branco, nulo })
})

app.get('/votos/:codfilial', catchAsyncErr(async (req, res) => {
    const [funcionarios] = await promiseMysql.query(...db.mysql.getFuncComVoto(req.params.codfilial))
    console.log(funcionarios[0].data_voto)
    res.render('listVotos.ejs', {funcionarios})
}))



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

app.get('/test', (req, res) => {
    res.render('fimVoto.ejs', {gestao})
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