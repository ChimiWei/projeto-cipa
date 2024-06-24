const mysqlPromise = require('../helpers/mysqlQuery')
const repository = require('../helpers/query-repo')

async function getUserByEmailOrLogin(login) {
    const [rows, fields] = await mysqlPromise.query(...repository.mysql.usuarioPorEmailouLogin(login))

    return rows[0]
}

async function getUserByEmail(email) {
    const [rows, fields] = await mysqlPromise.query(...repository.mysql.usuarioPorEmail(email))

    return rows[0]
}

async function getUserByLogin(login) {
    const [rows, fields] = await mysqlPromise.query(...repository.mysql.usuarioPorLogin(login))

    return rows[0]
}


async function getUserById(id) {
    const [rows, fields] = await mysqlPromise.query(...repository.mysql.usuarioPorId(id))

    return rows[0]
}

async function getUsers(id_empresa) {
    const [rows, fields] = await mysqlPromise.query(`select * from usuarios where id_empresa = ${id_empresa} and id_role <> 1`)

    return rows
}

module.exports = {
    getUserByEmailOrLogin,
    getUserByEmail,
    getUserByLogin,
    getUserById,
    getUsers
}