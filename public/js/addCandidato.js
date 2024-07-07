const funcNaoEncontradoEl = document.getElementById('funcNaoEncontrado')
const nomeEl = document.getElementById('nome')
const funcaoEl = document.getElementById('funcao')
const secaoEl = document.getElementById('secao')
const imgFuncEl = document.getElementById('imgFunc')
const msgCandidatoEl = document.getElementById('msgCandidato')
const linkFichaEl = document.getElementById('linkFicha')

funcNaoEncontradoEl.style = 'display: none;'
msgCandidatoEl.style = 'display: none;'
linkFichaEl.style = 'display: none;'

function ConvertBufferAndReturnImageURL(ImageBuffer) {
  if(!ImageBuffer) return "/img/profile-icon.png"
  const b64 = Buffer.from(ImageBuffer).toString('base64');
  const imageSrc = `data:image/jpg;base64, ${b64}`
  
  return imageSrc

}

imgFuncEl.style = 'display: none;'

async function getAPIData(url, encodedUser, candidatos) {
    if(!url) return

    console.log(`trying fetch url: ${url}`)
    try {
      const response = await fetch(url, {headers: new Headers({
        'Authorization': 'Basic ' + encodedUser,
        'Content-Type': 'application/json'
      })});
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const json = await response.json();

      if(json.length == 0 ){
        funcNaoEncontradoEl.style = "display: block;"
        return
      } 

      let func = json[0]
      console.log(func)
      nomeEl.textContent = `Funcionário: ${func.CHAPA} - ${func.NOME}`
      funcaoEl.textContent = `Função: ${func.FUNCAO}`
      secaoEl.textContent = `Setor: ${func.SECAO}`
      imgFuncEl.src = ConvertBufferAndReturnImageURL(func.IMAGEM),
      imgFuncEl.style = 'display: inline-block;'

      if(candidatos.find(candidato => candidato.chapa == func.CHAPA)) {
        msgCandidatoEl.style = 'display: block;'
      } else {
        linkFichaEl.style = 'display: inline-block'
        linkFichaEl.setAttribute('href', `/fichaCandidato/${func.CODFILIAL}/${func.CHAPA}`)
      }
    

    } catch (error) {
      console.error(error.message);
    }
  }
