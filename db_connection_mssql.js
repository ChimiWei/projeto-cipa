const sql = require('mssql')
const config = {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    database: process.env.MSSQL_DATABASE,
    server: process.env.MSSQL_SERVER,
    options: {
        trustedConnection: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        
      },
}

async function getPool() {
    try {
    console.log('mssql - tentando conexão')
    const pool = await sql.connect(config)
    console.log('mssql - conectado com sucesso')
    return pool
    } catch (e) {
        console.log(e)
    }
}

async function safeQuery(query) {
    try {
    console.log('mssql - tentando conexão')
    const pool = await sql.connect(config)
    console.log('mssql - conectado com sucesso')
    const stmt = new sql.PreparedStatement(pool)
    const stmtParams = {}
    query.params.forEach((param) => {
        stmtParams[param.name] = param.value
        if(param.type ==='varchar') {
            stmt.input(param.name, sql.VarChar)
        }
        if(param.type ==='int') {
            stmt.input(param.name, sql.Int)
        }
    })
    await stmt.prepare(query.sql)
    const result = (await stmt.execute(stmtParams)).recordset
    console.log(result)
    pool.close()
    return result
    } finally {
        
    }
   
}


/* pool.connect(err => {
    console.log('tentando conexão')
   if (err) return console.log(err)
   console.log('conectado com sucesso')
}) */

module.exports = {
    getPool,
    safeQuery
}