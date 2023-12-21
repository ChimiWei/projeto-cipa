const isTodayInRange = require('../helpers/isTodayInRange')
const promiseMysql = require('../helpers/promiseMysql')

var cipas = []

const getCipaAtiva = async () => {
    const [rows, fields] = await promiseMysql.query(`select * from cipaconfig where ativa=1`)
    
    rows.forEach((cipa) => {
        if(cipa.inscricaoAtiva === undefined) {
            const iniInsc = new Date(cipa.dtiniinsc.split('/').reverse())
            const fimInsc = new Date(cipa.dtfiminsc.split('/').reverse())
            const iniVoto = new Date(cipa.dtinivoto.split('/').reverse())
            const fimVoto= new Date(cipa.dtfimvoto.split('/').reverse())
            
            cipa.inscricaoAtiva = isTodayInRange(iniInsc, fimInsc)
    
            cipa.votacaoAtiva = isTodayInRange(iniVoto, fimVoto)
            
        }
    })

    cipas = await JSON.parse(JSON.stringify(rows))
    return cipas
}

module.exports = {
    cipas,
    getCipaAtiva
}