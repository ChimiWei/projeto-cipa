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

async function getVotePercentage(url, encodedUser, cipaid, total, element) {
    console.log(element.innerHTML)
    if(!url) return
    try {
      const response = await fetch(url, {headers: new Headers({
        'Authorization': 'Basic ' + encodedUser,
        'Content-Type': 'application/json'
      })});
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      
      const json = await response.json();
      const totalFunc = json[0].TOTAL

      let percentage = Math.floor((parseInt(total) * 100) / parseInt(totalFunc))

      element.innerHTML = percentage + "%"

    } catch (error) {
      console.error(error.message);
    }
}