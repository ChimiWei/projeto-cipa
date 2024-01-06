const isTodayInRange = require('../helpers/isTodayInRange')
const mysqlPromise = require('../helpers/mysqlQuery')

const getCipaAtiva = async () => {
    const [rows, fields] = await mysqlPromise.query(`select * from cipaconfig where ativa=1`)

    rows.forEach((cipa) => {
        if (cipa.inscricaoAtiva === undefined) {
            const iniInsc = new Date(cipa.dtiniinsc.split('/').reverse())
            const fimInsc = new Date(cipa.dtfiminsc.split('/').reverse())
            const iniVoto = new Date(cipa.dtinivoto.split('/').reverse())
            const fimVoto = new Date(cipa.dtfimvoto.split('/').reverse())

            cipa.inscricaoAtiva = isTodayInRange(iniInsc, fimInsc)

            cipa.votacaoAtiva = isTodayInRange(iniVoto, fimVoto)

        }
    })

    const cipas = rows
    return cipas
}


module.exports = {
    getCipaAtiva,
}