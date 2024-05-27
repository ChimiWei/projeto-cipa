const modal =  document.getElementById('modalSelect')
const selectForm = document.getElementById('selectForm')

function startModal(cipaid) {
    selectForm.action = `${location.pathname}/${cipaid}?_method=PUT`
    toggleModal()
}

const toggleModal = () => {
    modal.classList.toggle('show')
}

window.onclick = function(event) {
    if (event.target == modal) {
        toggleModal()
    }
  }