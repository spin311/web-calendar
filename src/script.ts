import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';

//return the day of the week the month starts on
function getMonthStart(month: number, year: number): number{
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

function changeCalendar(monthStart: number, nuDays: number): void{
    console.log("monthStart:",monthStart,"nuDays:" ,nuDays);
    let currentDay: number = 1;
    let table: string = `
    <table class="table table-info table-width tableCal">
            <thead>
                <caption>2021.08</caption>
                <tr>
                    <th>mon</th>
                    <th>tue</th>
                    <th>wed</th>
                    <th>thu</th>
                    <th>fri</th>
                    <th>sat</th>
                    <th>sun</th>
                </tr>
            </thead>
            <tbody>`;
    for(var i = 0; currentDay <= nuDays; i++){ 
        if(i % 7 === 0){
            table += "<tr>";
        }
        if (i < monthStart){
            table += "<td></td>";
        }
        else {
            table += "<td>" + currentDay + "</td>";
            currentDay++;
        }
        if (i % 7 === 6){
            table += "</tr>";
        }
    }
    while (i % 7 != 0){
        table += "<td></td>";
        if (i % 7 === 6){
            table += "</tr>";
        }
        i++;
    }
    table += "</tbody></table>";
    $("#calendar").html(table);

}
//return number of days in a month
function getNuDays(month: number, year: number): number{
    let lastDay: Date = new Date(year, month + 1, 0);
    return lastDay.getDate();
}

    //autocomplete
    const availableMonths = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    $("#months").autocomplete({
        source: availableMonths,
        minLength: 0 // Set the minimum length to 0 to show all options on click
    }).on("click", function() {
        $(this).autocomplete("search", "");
    });
$(function(){
    $(document).on("click", "#buttonCal", function(){
    
        // TODO: check that all inputs have value / give them starting value, disable button if not
        let month: string, year: number, monthNumber: number, nuDays: number, monthStart: number;
        year = parseInt($("#year").val() as string);
        month = ($("#months").val() as string);
        console.log(month, year);
        //map month to number
        const monthMap = new Map<string, number>([
            ["January", 0],
            ["February", 1],
            ["March", 2],
            ["April", 3],
            ["May", 4],
            ["June", 5],
            ["July", 6],
            ["August", 7],
            ["September", 8],
            ["October", 9],
            ["November", 10],
            ["December", 11]
          ]);
          if(monthMap.get(month) != undefined) {
            monthNumber = monthMap.get(month) as number;
            nuDays = getNuDays(monthNumber, year);
            monthStart = getMonthStart(monthNumber, year);
            console.log(monthNumber, "nuDays:", nuDays);
            changeCalendar(monthStart, nuDays);

          }
          else {
            console.log("cant get month value")

          }


      















        // let month: string, year: number;
        // year = parseInt($("#year").val() as string);
        // month = ($("#months").val() as string);
        // console.log(month, year);
        // // $("#tableHeader").val(month + " / " + year);
        // let days: number = getNuDays(1, 2021);
        // let start: number = monthStart(1, 2021);
        // console.log(days, start);
        // let table: string = "<table><tr><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Satuday</th><th>Sunday</th></tr>";
        // let day: number = 1;
        // let i: number = 0;
        // while (day <= days){
        //     table += "<tr>";
        //     for (i = 0; i < 7; i++){
        //         if (i < start){
        //             table += "<td></td>";
        //         }
        //         else{
        //             table += "<td>" + day + "</td>";
        //             day++;
        //         }
        //     }
        //     table += "</tr>";
        // }
        // table += "</table>";
        // $("#calendar").html(table);
});
});

