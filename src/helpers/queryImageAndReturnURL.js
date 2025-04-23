const ConvertBufferAndReturnImageURL = require("./convertBufferAndReturnImage");

const repository = require("./query-repo");


async function queryImageAndReturnURL(idimagem) {
    if(idimagem == 'undefined') return "/img/profile-icon.png"
    
    const result = await mssqlStmtQuery(repository.mssql.imagem(idimagem))
 
    if(result.length === 0) return "/img/profile-icon.png"
    
    const b64 = Buffer.from(result[0].imagem).toString('base64');
    const imageSrc = `data:image/jpg;base64, ${b64}`
        
    return imageSrc
}


module.exports = queryImageAndReturnURL