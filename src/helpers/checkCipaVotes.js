
const mysqlPromise = require('../helpers/mysqlQuery')
const repository = require('../helpers/query-repo')

const checkCipaVotes = async (codfilial, cipaid) => {
    const result = await mssqlStmtQuery(repository.mssql.funcTotalFilial(codfilial))
    const [rows] = await mysqlPromise.query(...repository.mysql.getTotalVotos(cipaid))
    console.log(rows)

    const [filial] = result
    const [votos] = rows

    let percentage = Math.floor((votos.total * 100) / filial.total)

    console.log(percentage + '%')

    if (percentage > 50) {
        return true
    } else {
        return false
    }

}

module.exports = checkCipaVotes;