const mysqlPromise = require("../helpers/mysqlQuery")
const repository = require("../helpers/query-repo")
const { getCipas } = require("../models/cipaModel")
const { getUserById, getUsers } = require("../models/userModel")
const bcrypt = require('bcrypt')



const adminController = {
    renderAdmin: async (req, res) => {
        const cipas = await getCipas()
        const users = await getUsers()
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
            console.log(req.body.option)
            console.log(result)
            return res.redirect('/admin')
        } else {

        const result = await mysqlPromise.query(...repository.mysql.putGestor(null, req.params.cipaid))
        console.log(result)
        res.redirect('/admin')

        }
    }, 

    renderAdminUsuarios: async (req, res) => {
        const users = await getUsers()
        const cipas = await getCipas()
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
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            let sql = `INSERT INTO usuario VALUES (default, '${req.body.name}', '${req.body.email}', '${hashedPassword}', 1, default, default)`
            mysqlPromise.query(sql)

            req.flash('notification', 'Usuário criado!')

            res.redirect('/admin/register')
            /* const user = {
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword}
            
            users.push(user)
            */

        } catch (e) {
            console.log(e)
            res.redirect('/admin/register')
        }


    }

}

module.exports = adminController