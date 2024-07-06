const confirmEl = document.getElementById('btnConfirm')
const infoEl = document.getElementById('info')
const enderecoEl = document.getElementById('endereco')
const contatoEl = document.getElementById('contato')
const nomeElements = document.querySelectorAll('.nome')
const funcaoElements = document.querySelectorAll('.funcao')
const secaoElements = document.querySelectorAll('.secao')
const chapaElements = document.querySelectorAll('.chapa')
const empresaElements = document.querySelectorAll('.empresa')
const chapa = document.getElementById('chapa');
const codcoligada = document.getElementById('codcoligada');
const codfilial = document.getElementById('codfilial');
const nome = document.getElementById('nome');
const funcao = document.getElementById('funcao');
const secao = document.getElementById('secao');
const idimagem = document.getElementById('idimagem');

function printForm() {
    window.print()
    toggleVisibility()
}

function toggleVisibility() {
    infoEl.style.visibility = 'hidden'
    confirmEl.disabled = false
}

async function getAPIData(url, encodedUser) {
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

      let func = json[0]
      console.log(func)
      enderecoEl.textContent = `${func.GCRUA}, ${func.GCNUMERO} - ${func.GCBAIRRO} - ${func.GCCIDADE}/${func.GCESTADO}`
      contatoEl.textContent = `C.G.C: ${func.GCCGC} Fone: ${func.GCTELEFONE}`

      nomeElements.forEach(element => element.textContent = func.NOME)
      funcaoElements.forEach(element => element.textContent = func.FUNCAO)
      secaoElements.forEach(element => element.textContent = func.SECAO)
      chapaElements.forEach(element => element.textContent = func.CHAPA)
      empresaElements.forEach(element => element.textContent = func.GCNOME)

      chapa.value = func.CHAPA
      codcoligada.value = func.CODCOLIGADA
      codfilial.value = func.CODFILIAL
      funcao.value = func.FUNCAO
      secao.value = func.SECAO
      idimagem.value = func.IDIMAGEM
      nome.value = func.NOME

    

    } catch (error) {
      console.error(error.message);
    }
  }
