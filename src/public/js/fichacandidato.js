const confirmEl = document.getElementById('btnConfirm')
const infoEl = document.getElementById('info')
console.log('oi')
function printForm() {
    window.print()
    toggleVisibility()
}

function toggleVisibility() {
    infoEl.style.visibility = 'hidden'
    confirmEl.disabled = false
}