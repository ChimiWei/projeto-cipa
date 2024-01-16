const mysqlPromise = require('../helpers/mysqlQuery')
const repository = require('../helpers/query-repo')

async function getUserByEmail(email) {  
    const [rows, fields] = await mysqlPromise.query(...repository.mysql.usuarioPorEmail(email))
    
    return rows[0]
}

async function getUserById(id) {
    const [rows, fields] = await mysqlPromise.query(...repository.mysql.usuarioPorId(id))
    
    return rows[0]
}

module.exports = { 
    getUserByEmail,
    getUserById
}