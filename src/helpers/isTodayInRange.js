
function isTodayInRange(firstDate, lastDate) {
    const today = new Date().toLocaleDateString('pt-br', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })



    const first = new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), firstDate.getUTCDate())).toLocaleDateString('pt-br', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })

    const last = new Date((Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate() + 1))).toLocaleDateString('pt-br', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })

    console.log(`${today} está entre ${first} e ${last}`)

    return (first <= today && today <= last)
}

module.exports = isTodayInRange