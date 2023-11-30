
function createDatepicker(startDate, endDate) {
    
    $('#datavotacao').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        startDate: endDate,
        daysOfWeekDisabled: "0,6",
        maxViewMode: 1
    })
}



console.log('test')