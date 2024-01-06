const pool = require('../../config/db_connection_mysql')

const mysqlPromise = pool.promise()

module.exports = mysqlPromise