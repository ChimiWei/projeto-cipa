const currentYear = new Date().getFullYear()
const minDate = '01/01/' + currentYear
const maxDate= '30/12/' + currentYear


$('#datainscricao').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    daysOfWeekDisabled: "0,6",
    startDate: minDate,
    endDate: maxDate,
    maxViewMode: 1
}) /*.on('changeDate', function(e) {
    // `e` here contains the extra attributes
    console.log(e.target.value)
    minVotacao = e.target.value
});*/

$('#datavotacao').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    daysOfWeekDisabled: "0,6",
    startDate: minDate,
    endDate: maxDate,
    maxViewMode: 1
})


$('#resultado-final').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    daysOfWeekDisabled: "0,6",
    startDate: minDate,
    endDate: maxDate,
    maxViewMode: 1
})

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
const iniGestao = document.getElementById('gestao')
const fimGestao = document.getElementById('gestaofim')

const getGestao = (event) => {
    console.log(event.target.value)
}


