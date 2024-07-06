const funcNaoEncontradoEl = document.getElementById('funcNaoEncontrado')
const nomeEl = document.getElementById('nome')
const funcaoEl = document.getElementById('funcao')
const secaoEl = document.getElementById('secao')
const imgFuncEl = document.getElementById('imgFunc')
const msgJaVotouEl = document.getElementById('msgJaVotou')
const btnVotanteEl = document.getElementById('btnVotante')
const chapa = document.getElementById('inputChapa');
const codcoligada = document.getElementById('inputCodcoligada');
const codfilial = document.getElementById('inputCodfilial');
const nome = document.getElementById('inputNome');
const funcao = document.getElementById('inputFuncao');
const secao = document.getElementById('inputSecao');

funcNaoEncontradoEl.style = 'display: none;'
msgJaVotouEl.style = 'display: none;'
btnVotanteEl.style = 'display: none;'

function ConvertBufferAndReturnImageURL(ImageBuffer) {
    if(!ImageBuffer) return "/img/profile-icon.png"
    const b64 = Buffer.from(ImageBuffer).toString('base64');
    const imageSrc = `data:image/jpg;base64, ${b64}`
    
    return imageSrc
  
  }
  
  imgFuncEl.style = 'display: none;'

async function getAPIData(url, encodedUser, votos) {
    if(!url) return

    votos = JSON.parse(votos)

    console.log(`trying fetch url: ${url}`)
    console.log(`encodedUser: ${encodedUser}`)
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

      

      if(votos.find(voto => voto.chapa == func.CHAPA)) {
        msgJaVotouEl.style = 'display: block;'
      } else {
        chapa.value = func.CHAPA
        nome.value = func.NOME
        codfilial.value = func.CODFILIAL
        funcao.value = func.FUNCAO
        secao.value = func.SECAO
        
        btnVotanteEl.style = 'display: inline-block'
      }

    

    } catch (error) {
      console.error(error.message);
    }
  }
