
function generateToken() {
    let randomToken = Math.random().toString(36).slice(2, 8)
    console.log(randomToken)
    if(randomToken.length >= 6 && randomToken.search(/\d{1,3}/) != -1) return randomToken

    return generateToken()
}

module.exports = generateToken