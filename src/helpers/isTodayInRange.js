
function isTodayInRange(firstD, lastD) {
    const currentDate = new Date()
  //  console.log(`${formatDate(currentDate)} está entre ${formatDate(firstD)} e ${formatDate(lastD)}`)
    return (firstD <= currentDate && currentDate <= lastD)
}

module.exports = isTodayInRange