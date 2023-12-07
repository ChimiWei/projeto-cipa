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

var candidatosAuth = false

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


const checkCipaVotes = async (codfilial, cipaid) => {
    const result = await mssql.safeQuery(db.mssql.funcTotalFilial(codfilial))
    const [rows] = await promiseMysql.query(...db.mysql.getTotalVotos(cipaid))
    console.log(rows)

    const [filial] = result
    const [votos] = rows

    let percentage = Math.floor((votos.total * 100)/filial.total)

    console.log(percentage + '%')

}

function isTodayInRange(firstD, lastD) {
    const currentDate = new Date()
  //  console.log(`${formatDate(currentDate)} está entre ${formatDate(firstD)} e ${formatDate(lastD)}`)
    return (firstD <= currentDate && currentDate <= lastD)
}

function formatDate(date){
    let formatedDate = ((date.getDate() )) + "/" + ((date.getMonth() + 1)) + "/" + (date.getFullYear())

    return formatedDate
}

function generateToken() {
    let randomToken = Math.random().toString(36).slice(2, 8)
    console.log(randomToken)
    if(randomToken.length >= 6 && randomToken.search(/\d{1,3}/) != -1) return randomToken

    return generateToken()
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
    
    rows.forEach((cipa) => {
        if(cipa.inscricaoAtiva === undefined) {
            const iniInsc = new Date(cipa.dtiniinsc.split('/').reverse())
            const fimInsc = new Date(cipa.dtfiminsc.split('/').reverse())
            const iniVoto = new Date(cipa.dtinivoto.split('/').reverse())
            const fimVoto= new Date(cipa.dtfimvoto.split('/').reverse())
            
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
        const [rows] = await promiseMysql.query(...db.mysql.candidatos(cipaid))
        return rows
    } catch (e) {
        console.log(e)
    }

}



app.get('/', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    await getCipaAtiva()

    res.render('home.ejs', { user: req.user, gestao: gestao, cipas: cipas })
}))

app.post('/', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {

}))

app.get('/cipaconfig', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    const filiais = await mssqlQuery('select codcoligada, codfilial, nome from gfilial where codcoligada = 1')
    res.render('cipaconfig.ejs', { user: req.user, gestao: gestao, filiais: filiais, cipas: cipas, message: req.flash() })
}))

app.post('/cipaconfig', catchAsyncErr(async (req, res) => {
    const [codfilial, filial] = req.body.filial.split(',')
    const codcoligada = 1
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
    await promiseMysql.query(...db.mysql.cadastrarCipa(codcoligada, codfilial, filial, ano, req.body.inscricaoini, req.body.fiminscricao,
        req.body.inivotacao, req.body.fimvotacao, req.body.resultado))
    
    await getCipaAtiva()

    const cipa = cipas.find(cipa => cipa.codfilial == codfilial)

    if(cipa) {
        await promiseMysql.query(...db.mysql.addToken(cipa.id, codcoligada, codfilial, generateToken()))
        await promiseMysql.query(...db.mysql.cadastrarVoto(cipa.id, "BRA"))
        await promiseMysql.query(...db.mysql.cadastrarVoto(cipa.id, "NUL"))
    } else {
        return res.send("ocorreu um erro")
    }
    
    console.log('cipa cadastrada com sucesso')
    res.redirect('/')
}))

app.get('/edit_cipa/:codfilial', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
    if (!cipa) return res.redirect('/')
    res.render('editCipa.ejs', { user: req.user, gestao: gestao, cipa, message: req.flash() })
}))

app.put('/edit_cipa/:codfilial', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
    if (!cipa) return res.redirect('/')
    
    const [result] = await promiseMysql.query(...db.mysql.editCipa(req.body.fimvotacao, cipa.id))
    console.log(result)

    if(result.affectedRows === 0){
        return res.redirect(`/edit_cipa/<%= cipa.codfilial %>`)
    } 

    return res.redirect('/')
    
}))

app.get('/cadastro_candidato/:codfilial', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
    if (!cipa || !cipa.inscricaoAtiva) return res.redirect('/')
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
    if (!cipa || !cipa.inscricaoAtiva) return res.redirect('/')
    const candidatos = await getCandidatos(cipa.id)
    const chapa = req.params.chapa
    if (candidatos.find(func => func.chapa === chapa)) res.send('Funcionário já cadastrado!')
    const [rows] = await promiseMysql.query(...db.mysql.maxNVotacao(cipa.id))
    const maxNVotacao = rows[0].maxnvotacao ? rows[0].maxnvotacao : '001'
    const func = await mssql.safeQuery(db.mssql.funcComColigada(req.params.codfilial, chapa))
    res.render('fichaCandidato.ejs', { func: func[0], n_votacao: maxNVotacao, hoje })

}))

app.put('/fichaCandidato', catchAsyncErr(async (req, res) => {
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
    await promiseMysql.query(...db.mysql.cadastrarCandidato(cipa.id, nvotacao, req.body.codcoligada, codfilial, chapa, req.body.nome, req.body.funcao, req.body.secao, ano))
    await promiseMysql.query(...db.mysql.cadastrarVoto(cipa.id, nvotacao))
    res.redirect('/candidatos/' + codfilial)
}))

app.get('/iniciar_votacao/:codfilial', catchAsyncErr(async (req, res) => {
    const codfilial = req.params.codfilial
    const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
    if (!cipa || !cipa.votacaoAtiva) return res.redirect('/')
    await checkCipaVotes(codfilial, cipa.id)
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
    if(!votante.func) return res.redirect('/')
    const func = votante.func
    const [voto] = await promiseMysql.query(...db.mysql.checarVoto(votante.cipaid, func.chapa))
    if(voto[0]) {
        req.flash("error", "Funcionário já votou")
        return res.redirect(`/iniciar_votacao/${func.codfilial}`)
    }
    if (req.body.confirmacao == votante.func.confirmacao) {
        const candidatos = await getCandidatos(votante.cipaid)
        const candidato = candidatos.find(candidato => candidato.n_votacao === votante.nvotacao)
        const result = await promiseMysql.query(...db.mysql.addVoto(votante.cipaid, candidato ? candidato.n_votacao : votante.nvotacao))

        console.log('Resultado:')
        console.log(result[0])

        if(result[0].changedRows === 0) {
            req.flash("error", "Ocorreu um erro com seu voto.")
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            return res.redirect('back');
        }

        await promiseMysql.query(...db.mysql.registrarVoto(votante.cipaid, func.codcoligada, func.codfilial, func.chapa, func.nome, func.secao))
        req.flash("nome", func.nome)
        votante.func = null
        votante.nvotacao = null
        return res.redirect(`/voto_finalizado/${func.codfilial}`)
    } else {
        req.flash("error", "Os digitos inseridos estão incorretos")
        return res.redirect(`/confirmar_voto/${func.codfilial}/${votante.nvotacao}`)
    }
}))

app.get('/voto_finalizado/:codfilial', (req, res) => {
    res.render('fimVoto.ejs', {gestao, message: req.flash()})
})


app.get('/autorizar_delete/:codfilial', /*checkAuthenticated,*/ async (req, res) => {

    res.render('autorizarEncerramento.ejs', {codfilial: req.params.codfilial, message: req.flash()})
})

app.put('/encerrar_cipa/:codfilial', /*checkAuthenticated,*/ catchAsyncErr(async (req, res) => {
    const codfilial = req.params.codfilial
    const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
    if (!cipa) return res.redirect('/')
    
    const [rows] = await promiseMysql.query(...db.mysql.getCipaToken(cipa.id, codfilial))
    const {token} = rows[0]
    
    if(req.body.token === token) {
        const cipaid = cipa.id
        console.log('cipa id:')
        console.log(cipaid)
        await promiseMysql.query(...db.mysql.suspendCipa(cipaid))

        
        getCipaAtiva()

        return res.redirect('/')
    } else {
        req.flash("error", "Token Incorreto")
        return res.redirect(`/autorizar_delete/${codfilial}`)
    }
}))

/*
app.delete('/autorizar_delete/:codfilial', /*checkAuthenticated, <////>catchAsyncErr(async (req, res) => {
    const codfilial = req.params.codfilial
    const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
    if (!cipa) return res.redirect('/')
    
    const [rows] = await promiseMysql.query(...db.mysql.getCipaToken(cipa.id, codfilial))
    const {token} = rows[0]
    
    if(req.body.token === token) {
        const cipaid = cipa.id
        console.log('cipa id:')
        console.log(cipaid)
        await promiseMysql.query(...db.mysql.deleteRegistroVoto(cipaid))
        await promiseMysql.query(...db.mysql.deleteVoto(cipaid))
        await promiseMysql.query(...db.mysql.deleteInscritos(cipaid))
        await promiseMysql.query(...db.mysql.deleteToken(cipaid))
        await promiseMysql.query(...db.mysql.deleteCipa(cipaid))
        
        getCipaAtiva()

        return res.redirect('/')
    } else {
        req.flash("error", "Token Incorreto")
        return res.redirect(`/autorizar_delete/${codfilial}`)
    }
}))

app.delete('/solicitar_alteracao/:cipaid', catchAsyncErr(async (req, res) => {
    if(!deleteAuth) return res.redirect('/')
    
    const cipaid = req.params.cipaid

    await promiseMysql.query(...db.mysql.deleteRegistroVoto(cipaid))
    await promiseMysql.query(...db.mysql.deleteVoto(cipaid))
    await promiseMysql.query(...db.mysql.deleteInscritos(cipaid))
    await promiseMysql.query(...db.mysql.deleteCipa(cipaid))
    
    getCipaAtiva()

    deleteAuth = false

    res.redirect('/')

}))
*/
app.get('/autorizar_acesso/:codfilial', /*checkAuthenticated,*/ async (req, res) => {

    res.render('autorizarAcesso.ejs', {codfilial: req.params.codfilial, message: req.flash()})
})

app.post('/autorizar_acesso/:codfilial', /*checkAuthenticated,*/ async (req, res) => {
    const codfilial = req.params.codfilial
    const cipa = cipas.find(cipa => cipa.codfilial == codfilial)
    if (!cipa) return res.redirect('/')
    
    const [rows] = await promiseMysql.query(...db.mysql.getCipaToken(cipa.id, codfilial))
    const {token} = rows[0]
    
    if(req.body.token === token) {
        candidatosAuth = true
        return res.redirect(`/candidatos/${codfilial}`)
    } else {
        req.flash("error", "Token Incorreto")
        return res.redirect(`/autorizar_acesso/${codfilial}`)
    }
})

app.get('/candidatos/:codfilial', /*checkAuthenticated,*/ async (req, res) => {
    if(!candidatosAuth) return res.redirect('/')
    candidatosAuth = false
    const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
    if (!cipa) return res.redirect('/')
    const candidatos = await getCandidatos(cipa.id)
    
    // bubble sort lets gooooooooooo
    for(let i = 0; i < candidatos.length; i++){
        for(let j = 0; j < candidatos.length - 1; j++){
            if(candidatos[j].votos < candidatos[j + 1].votos){
                const temp = candidatos[j]
                candidatos[j] = candidatos[j + 1]
                candidatos[j + 1] = temp
            }
        }
    }

    const [rows] = await promiseMysql.query(...db.mysql.getVotos(cipa.id))
    const [branco, nulo] = rows

    res.render('listCandidato.ejs', { user: req.user, candidatos: candidatos, branco, nulo })
})

app.get('/votos/:codfilial', catchAsyncErr(async (req, res) => {
    const cipa = cipas.find(cipa => cipa.codfilial == req.params.codfilial)
    if (!cipa) return res.redirect('/')
    const [funcionarios] = await promiseMysql.query(...db.mysql.getFuncComVoto(cipa.id))
    res.render('listVotos.ejs', {funcionarios})
}))

app.get('/perfil', /*checkAuthenticated,*/(req, res) => {
    res.render('profile.ejs', { user: req.user })
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