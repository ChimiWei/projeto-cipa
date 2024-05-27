const editForm = document.getElementById('editForm')
const modalCipa = document.getElementById('modalCipa')
const tokenForm = document.getElementById('tokenForm')

function startup(endDate, error) {
    createDatepicker(endDate)

    if (error) toggleModal()


}

function createDatepicker(endDate) {

    $('#datavotacao').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        startDate: endDate,
        daysOfWeekDisabled: "0,6",
        maxViewMode: 1
    })
}

function handleEditSubmit(e) {
    e.preventDefault()

    let isValid = editForm.checkValidity()
    if (!isValid) return editForm.reportValidity()

    let editInputEl = document.getElementById('fimVoto')

    tokenForm.action = `${location.pathname}?_method=PUT&fimvotacao=${editInputEl.value}`
    toggleModal()


}

function handleDeleteSubmit(e) {
    e.preventDefault()

    tokenForm.action = `${location.pathname}?_method=DELETE`
    toggleModal()


}


function toggleModal() {
    modalCipa.classList.toggle('show')
}



