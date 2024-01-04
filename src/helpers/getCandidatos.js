const getCandidatos = async (cipaid) => {
    if (!cipas) return // interrompe a função se não houver uma cipa ativa
    try {
        const [rows] = await promiseMysql.query(...db.mysql.candidatos(cipaid))
        return rows
    } catch (e) {
        console.log(e)
    }

}

module.exports = getCandidatos