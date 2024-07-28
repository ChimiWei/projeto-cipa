const imgs = document.getElementsByTagName('img')

async function getImgSrc() {

    for (img of imgs){
        console.log(img.id)
    
        let imgBuffer = await getAPIData(url, encodedUser, img.id)
        img.src = ConvertBufferAndReturnImageURL(imgBuffer)
    }
}

getImgSrc()



async function getAPIData(url, encodedUser, idimagem) {
    if(!url) return 
    if(idimagem == 'undefined') return "/img/profile-icon.png"
    
    console.log(`trying fetch url: ${url + idimagem}`)

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

        return result.IMAGEM

    } catch (e) {
        console.log(e)
    }

}