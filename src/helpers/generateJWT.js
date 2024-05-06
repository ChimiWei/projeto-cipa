const jwt = require('jsonwebtoken');

function generateJWT(payload) {
    
    // Define your private key
    const privateKey = process.env.PRIVATE_KEY;

    // Generate the JWT
    const token = jwt.sign(payload, privateKey, { expiresIn: '1h' }); 
    
    return token
}

module.exports = generateJWT
