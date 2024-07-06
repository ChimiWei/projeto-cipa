const imgs = document.getElementsByTagName('img')

async function getImgSrc() {

    for (img of imgs){
        console.log(img.id)
    
        img.src = await getAPIData(url, encodedUser, img.id)
    }
}

getImgSrc()


function ConvertBufferAndReturnImageURL(ImageBuffer) {
    if(!ImageBuffer) return "/img/profile-icon.png"
    const b64 = Buffer.from(ImageBuffer).toString('base64');
    const imageSrc = `data:image/jpg;base64, ${b64}`
    
    return imageSrc
  
  }

async function getAPIData(url, encodedUser, idimagem) {
    if(!url) return 
    if(idimagem == 'undefined') return "/img/profile-icon.png"
    
    console.log(`trying fetch url: ${url}`)

    try {
        const response = await fetch((url + idimagem), {headers: new Headers({
            'Authorization': 'Basic ' + encodedUser,
            'Content-Type': 'application/json'
        })})
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        const json = await response.json();

        const result = json[0]

        return result.imagem

    } catch (e) {
        console.log(e)
    }

}