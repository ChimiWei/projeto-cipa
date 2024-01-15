
function isTodayInRange(firstD, lastD) {
    const today = new Date()
    const currentDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    
    return (firstD <= currentDate && currentDate <= lastD)
}

module.exports = isTodayInRange