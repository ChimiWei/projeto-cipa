const mysql = require('../../config/db_connection_mysql')

const promiseMysql = mysql.promise()

module.exports = promiseMysql