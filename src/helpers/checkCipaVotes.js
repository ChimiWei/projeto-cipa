const { mssqlStmtQuery } = require('../helpers/mssqlQuery')
const mysqlPromise = require('../helpers/mysqlQuery')
const db = require('../helpers/query-repo')

const checkCipaVotes = async (codfilial, cipaid) => {
    const result = await mssqlStmtQuery(db.mssql.funcTotalFilial(codfilial))
    const [rows] = await mysqlPromise.query(...db.mysql.getTotalVotos(cipaid))
    console.log(rows)

    const [filial] = result
    const [votos] = rows

    let percentage = Math.floor((votos.total * 100) / filial.total)

    console.log(percentage + '%')

}

module.exports = checkCipaVotes;