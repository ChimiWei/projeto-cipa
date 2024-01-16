const { getCipaAtiva } = require('../models/cipaModel')
const mysqlPromise = require('./mysqlQuery')
const repository = require('../helpers/query-repo')

const getCandidatos = async (cipaid) => {
    const cipas = await getCipaAtiva()
    if (!cipas) return // interrompe a função se não houver uma cipa ativa
    try {
        const [rows] = await mysqlPromise.query(...repository.mysql.candidatos(cipaid))
        return rows
    } catch (e) {
        console.log(e)
    }

}

module.exports = getCandidatos