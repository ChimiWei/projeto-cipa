const currentYear = new Date().getFullYear()
const minDate = '01/01/' + currentYear
const maxDate = '30/12/' + currentYear
const iniInsc = document.getElementById('IniInsc')
const fimInsc = document.getElementById('FimInsc')
const iniVoto = document.getElementById('IniVoto')
const fimVoto = document.getElementById('FimVoto')
const resultadoFinal = document.getElementById('resultadoFinal')
const selectFilial = document.getElementById('selectFilial')
const errFilial = document.getElementById('errFilial')
const cipaModal = document.getElementById('modalCipa')
const cipaForm = document.getElementById('cipaForm')

let changeDatepicker = false

$('#confirmCipa').hide()
$('#formBody').hide()

const resetVotacao = () => {
    $('#datavotacao').datepicker('destroy')
    $('#votacao').hide()
    iniVoto.value = ''
    fimVoto.value = ''
    changeDatepicker = true
}

const resetResultado = () => {
    $('#resultadoFinal').datepicker('destroy')
    $('#resultadoFinal').val('')
    $('#resultado').hide()

    changeDatepicker = true
}

$('#datainscricao').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    daysOfWeekDisabled: "0,6",
    startDate: minDate,
    endDate: maxDate,
    maxViewMode: 1
}).on('changeDate', function (e) {
    // `e` here contains the extra attributes
    console.log(e.target.value)
    votoDatepicker(e.target.value)
});

$('#votacao').hide()

const votoDatepicker = (MinVotacao) => {
    if (MinVotacao && changeDatepicker) {
        const arrDate = MinVotacao.split('/')
        const date = new Date(arrDate[1] + '/' + arrDate[0] + '/' + arrDate[2])
        date.setDate(date.getDate() + 1)
        console.log(date)
        $('#votacao').show()
        $('#datavotacao').datepicker({
            format: 'dd/mm/yyyy',
            autoclose: true,
            daysOfWeekDisabled: "0,6",
            startDate: date,
            endDate: maxDate,
            maxViewMode: 1
        }).on('changeDate', function (e) {
            // `e` here contains the extra attributes
            console.log(e.target.value)
            resultadoDatepicker(e.target.value)
        });
        changeDatepicker = false
    }
}

$('#resultado').hide()
const resultadoDatepicker = (MinVotacao) => {
    if (MinVotacao && changeDatepicker) {
        const arrDate = MinVotacao.split('/')
        const date = new Date(arrDate[1] + '/' + arrDate[0] + '/' + arrDate[2])
        date.setDate(date.getDate() + 1)
        console.log(date)
        $('#resultado').show()
        $('#resultadoFinal').datepicker({
            format: 'dd/mm/yyyy',
            autoclose: true,
            daysOfWeekDisabled: "0,6",
            startDate: date,
            endDate: maxDate,
            maxViewMode: 1
        }).on('changeDate', function (e) {
            // `e` here contains the extra attributes
            $('#MessageGuide').hide()
            $('#confirmCipa').show()
        });
    }
    changeDatepicker = false
}

const checkFilial = (filiais, selectedFilial) => {
    const [codfilial, filial] = selectedFilial.split(',')
    if (JSON.parse(filiais).find(filial => filial.codfilial == codfilial)) {
        errFilial.style.visibility = 'visible'
        $('#formBody').hide()
    } else {
        errFilial.style.visibility = 'hidden'
        $('#formBody').show()
    }
}

/*
$('#gestao').datepicker({
    format: 'yyyy',
    autoclose: true,
   viewMode: "years", 
  minViewMode: "years",     
 }).on('changeDate', (e)=>{
   console.log(e.target.value)
   const selectedYear = parseInt(e.target.value)
   const nextYear = selectedYear + 1
   fimGestao.value = nextYear
})
*/

function handleSubmit(e) {
    let isValid = cipaForm.checkValidity()
    if (!isValid) return cipaForm.reportValidity()

    e.preventDefault()
    cipaModal.classList.toggle('show')
    let selectFilialEl = document.getElementById('confirmFilial')
    let [codfilial, filial] = selectFilial.value.split(',')
    selectFilialEl.textContent = filial
    let iniInscEl = document.getElementById('confirmIniInsc')
    iniInscEl.textContent = iniInsc.value
    let fimInscEl = document.getElementById('confirmFimInsc')
    fimInscEl.textContent = fimInsc.value
    let iniVotoEl = document.getElementById('confirmIniVoto')
    iniVotoEl.textContent = iniVoto.value
    let fimVotoEl = document.getElementById('confirmFimVoto')
    fimVotoEl.textContent = fimVoto.value
    let resultadoFinalEl = document.getElementById('confirmResultadoFinal')
    resultadoFinalEl.textContent = resultadoFinal.value

}

function cipaFormSubmit() {
    cipaForm.submit()
}


function closeModal() {
    cipaModal.classList.toggle('show')
}
