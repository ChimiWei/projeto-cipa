const mysqlPromise = require("../helpers/mysqlQuery")
const repository = require("../helpers/query-repo")
const { getCipas } = require("../models/cipaModel")
const { getUserById, getUsers } = require("../models/userModel")
const bcrypt = require('bcrypt')


const adminController = {
    renderAdmin: async (req, res) => {
        const cipas = await getCipas()
        const users = await getUsers()
        for(const cipa of cipas) { 
           let user = cipa.gestorid ? (users.find(user => user.id == cipa.gestorid)) : null

           cipa.gestorLogin = user ? user.login : null
          // cipa.gestorPassword = user ? user.password : null

        }
        
        console.log(cipas)

        res.render('admin.ejs', {cipas, options: users})
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
        console.log(users)
        res.render('adminUsuarios.ejs', {users})
    },
    putAdminVerifyUser: async (req, res) => {
        if(req.params.userid){
            const result = await mysqlPromise.query(...repository.mysql.verifyUser(req.params.userid))
            res.redirect('/admin/usuarios')
            
        }
    }

}

module.exports = adminController