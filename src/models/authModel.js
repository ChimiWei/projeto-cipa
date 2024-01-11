var candidatosPageAuth = false

function getCandidatosPageAuth(){
    return candidatosPageAuth
}

function setCandidatosPageAuth(boolean) {
    candidatosPageAuth = boolean
}




module.exports = {
    getCandidatosPageAuth, setCandidatosPageAuth
}