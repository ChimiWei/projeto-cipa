


function formatDate(date){
    let formatedDate = ((date.getDate() )) + "/" + ((date.getMonth() + 1)) + "/" + (date.getFullYear())

    return formatedDate
}

module.exports = formatDate