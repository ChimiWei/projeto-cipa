const jwt = require('jsonwebtoken');

function generateJWT(payload, lifetime) {
    
    // Define your private key
    const privateKey = process.env.PRIVATE_KEY;

    // Generate the JWT
    const token = jwt.sign(payload, privateKey, { expiresIn: lifetime }); 
    
    return token
}

module.exports = generateJWT
