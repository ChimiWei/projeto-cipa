const jwt = require('jsonwebtoken');



function validateJWTAndReturnPayload(token) {
    try {
        const payload = jwt.verify(token, process.env.PRIVATE_KEY);
        
        return payload;
    } catch (error) {
        console.error('JWT validation error:', error.message);
        return null;
    }
}

module.exports = validateJWTAndReturnPayload