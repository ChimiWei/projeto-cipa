const modal =  document.getElementById('candidatoModal')

const candidatoModal = (CHAPA, NOME, SECAO, N_VOTACAO, IMAGEM) => {
   modal.classList.toggle('show')
   let funcEl = document.getElementById('Func')
   let secaoEl = document.getElementById('Secao')
   let NVotacaoEl = document.getElementById('NVotacao')
   let imgEl = document.getElementById('Imagem')
   let btnConfirmarVotoEl = document.getElementById('btnConfirmarVoto')
   console.log(CHAPA)
   funcEl.textContent = `Funcionário: ${CHAPA} ${NOME}`
   secaoEl.textContent = `Seção: ${SECAO}`
   NVotacaoEl.textContent = N_VOTACAO
   imgEl.src = IMAGEM
   btnConfirmarVotoEl.value = N_VOTACAO
    
}

const toggleModal = () => {
    modal.classList.toggle('show')
}

window.onclick = function(event) {
    if (event.target == modal) {
        toggleModal()
    }
  }