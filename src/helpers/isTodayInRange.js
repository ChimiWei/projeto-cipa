
function isTodayInRange(firstDate, lastDate) {
    const today = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })

    console.log(`TESTE: ${today} está entre ${firstDate} e ${lastDate}`)

    const first = new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), firstDate.getUTCDate())).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })

    const last = new Date((Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate() + 20))).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })

    console.log(`${today} está entre ${first} e ${last}`)

    console.log(today >= last)

    return (first <= today && today <= last)
}

module.exports = isTodayInRange