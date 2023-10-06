const currentYear = new Date().getFullYear()
const minDate = '01/01/' + currentYear
const maxDate = '30/12/' + currentYear
const iniVoto = document.getElementById('IniVoto')
const fimVoto = document.getElementById('FimVoto')
let changeDatepicker = false

const resetVotacao = () => {
    $('#datavotacao').datepicker('destroy')
    $('#votacao').hide()
    iniVoto.value = ''
    fimVoto.value = ''
    changeDatepicker = true
}

const resetResultado = () => {
    $('#resultado-final').datepicker('destroy')
    $('#resultado-final').val('')
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
}).on('changeDate', function(e) {
    // `e` here contains the extra attributes
    console.log(e.target.value)
    votoDatepicker(e.target.value)
});

$('#votacao').hide()

const votoDatepicker = (MinVotacao) => {
    if(MinVotacao && changeDatepicker) {
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
    }).on('changeDate', function(e) {
        // `e` here contains the extra attributes
        console.log(e.target.value)
        resultadoDatepicker(e.target.value)
    });
    changeDatepicker = false
    }
}

$('#resultado').hide()
const resultadoDatepicker = (MinVotacao) => {
    if(MinVotacao && changeDatepicker) {
        const arrDate = MinVotacao.split('/')
        const date = new Date(arrDate[1] + '/' + arrDate[0] + '/' + arrDate[2])
        date.setDate(date.getDate() + 1)
        console.log(date)
        $('#resultado').show()
        $('#resultado-final').datepicker({
            format: 'dd/mm/yyyy',
            autoclose: true,
            daysOfWeekDisabled: "0,6",
            startDate: date,
            endDate: maxDate,
            maxViewMode: 1
        })
    }
    changeDatepicker = false
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



