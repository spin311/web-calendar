import $ from 'jquery';
function monthStart(month: number, year: number): number{
    const dateDay: Date = new Date(year, month, 1);

    // day =  0sunday-6saturday
    let day: number = dateDay.getDay();
    //want to return 0 for monday and 6 for sunday
    if (day === 0){
        return 6;
    }
    else{
        return (day-1);
    }
   
}

function changeCalendar(month: number, year: number): void{


}
//return number of days in a month
function getNuDays(month: number, year: number): number{
    let lastDay: Date = new Date(year, month, 0);
    return lastDay.getDate();
}
//run when page is loaded
$(function(){
    console.log("ready");
    $(document).on("blur", "input", function(){
        let month: number, year: number;
        year = parseInt($("#year").val() as string);
        month = parseInt($("#month").val() as string);
        console.log(month, year);
        $("#tableHeader").val(month + " / " + year);
    });
});


