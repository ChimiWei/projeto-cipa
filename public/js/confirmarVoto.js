const formConfirmacaoEl = document.getElementById('formConfirmacao')
const confirmacaoEl = document.getElementById('confirmacao')


function ConvertBufferAndReturnImageURL(ImageBuffer) {
    if(!ImageBuffer) return "/img/profile-icon.png"
    const b64 = Buffer.from(ImageBuffer).toString('base64');
    const imageSrc = `data:image/jpg;base64, ${b64}`
    
    return imageSrc
  
  }

async function getAPIData(url, encodedUser, digitos) {
    if(!url) return
  
    console.log(`trying fetch url: ${url + digitos}`)
    try {
      const response = await fetch((url + digitos), {headers: new Headers({
        'Authorization': 'Basic ' + encodedUser,
        'Content-Type': 'application/json'
      })})
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
  
      const json = await response.json();

      let result = json[0]
      console.log(result)

      return result.CONFIRMACAO

    } catch (error) {
      console.error(error.message);
    }
  }

async function formSubmit(event, url, encodedUser){
    event.preventDefault()
    const confirmacao = await getAPIData(url, encodedUser, event.srcElement[0].value)
    confirmacaoEl.value = confirmacao
    formConfirmacaoEl.submit()
  }