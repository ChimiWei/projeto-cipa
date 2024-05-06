const { sql, config } = require('../../config/db_connection_mssql')

async function mssqlQuery(query) {
    try {
        console.log('mssql - tentando conexão')
        const pool = await sql.connect(config)
        console.log('mssql - conectado com sucesso')
        const result = (await pool.query(query)).recordset
        return result

    } catch (e) {
        console.log(e)
    }
}

async function mssqlStmtQuery(query) {
    try {
        console.log('mssql - tentando conexão')
        const pool = await sql.connect(config)
        console.log('mssql - conectado com sucesso')
        const stmt = new sql.PreparedStatement(pool)
        const stmtParams = {}
        query.params.forEach((param) => {
            stmtParams[param.name] = param.value
            if (param.type === 'varchar') {
                stmt.input(param.name, sql.VarChar)
            }
            if (param.type === 'int') {
                stmt.input(param.name, sql.Int)
            }
        })
        await stmt.prepare(query.sql)
        const result = (await stmt.execute(stmtParams)).recordset
        
        pool.close()
        return result
    } finally {

    }

}

module.exports = {
    mssqlQuery,
    mssqlStmtQuery
}
