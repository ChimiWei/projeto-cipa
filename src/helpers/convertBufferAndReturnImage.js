

function ConvertBufferAndReturnImageURL(ImageBuffer) {
    if(!ImageBuffer) return "/img/profile-icon.png"
    const b64 = Buffer.from(ImageBuffer).toString('base64');
    const imageSrc = `data:image/jpg;base64, ${b64}`
    
    return imageSrc

}

module.exports = ConvertBufferAndReturnImageURL