const generateToken = require("../helpers/generateToken")
const mysqlPromise = require("../helpers/mysqlQuery")
const repository = require("../helpers/query-repo")
const { getCipas } = require("../models/cipaModel")
const { getUserById, getUsers } = require("../models/userModel")
const bcrypt = require('bcrypt')



const adminController = {
    renderAdmin: async (req, res) => {
        const cipas = await getCipas(req.user.id_empresa)
        const users = await getUsers(req.user.id_empresa)
        
        let selectOptions = users
        for(const cipa of cipas) { 
            let user = cipa.gestorid ? (users.find(user => user.id == cipa.gestorid)) : null
            
            cipa.gestorLogin = user ? user.login : null

            if(user) selectOptions.splice(selectOptions.findIndex(gestor => gestor.id == user.id), 1)

            
          // cipa.gestorPassword = user ? user.password : null

        }

        res.render('admin.ejs', {cipas, selectOptions, url: req.url})
    },
    putAdmin: async (req, res) => {
        if(req.body.option) {
            const result = await mysqlPromise.query(...repository.mysql.putGestor(req.body.option, req.params.cipaid))
            
            return res.redirect('/admin')
        } else {

        const result = await mysqlPromise.query(...repository.mysql.putGestor(null, req.params.cipaid))
        console.log(result)
        res.redirect('/admin')

        }
    }, 

    renderAdminUsuarios: async (req, res) => {
        const users = await getUsers(req.user.id_empresa)
        const cipas = await getCipas(req.user.id_empresa)
        users.forEach(user => {
            const cipa = cipas.find(cipa => cipa.gestorid == user.id)
            user.filial = cipa ? cipa.filial : null
        })
        
        res.render('adminUsuarios.ejs', {users, url: req.url})
    },
    putAdminVerifyUser: async (req, res) => {
        if(req.params.userid){
            const result = await mysqlPromise.query(...repository.mysql.verifyUser(req.params.userid))
            res.redirect('/admin/usuarios')
            
        }
    },
    renderAdminRegister: (req, res) => {
        res.render('adminRegister.ejs', {url: req.url, message: req.flash()})
    },
    putAdminRegister: async (req, res) => {
        
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let sql = `INSERT INTO usuario VALUES (default, '${req.body.name}', '${req.body.email}', '${hashedPassword}', 1, default, default)`
        mysqlPromise.query(sql)

        req.flash('notification', 'Usuário criado!')

        res.redirect('/admin/register')
            

    },

    putGenerateInviteToken: async (req, res) => {
        const token = generateToken()
        const user = req.user
        const result = await mysqlPromise.query(...repository.mysql.putConviteToken(user.id_empresa, token))
        if (result[0].affectedRows === 0) {
            req.flash("error", "Ocorreu um erro na criação do token")
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            return res.redirect('back');
        }

        req.flash('token', token)
        res.redirect('/admin/register')
    }

}

module.exports = adminController