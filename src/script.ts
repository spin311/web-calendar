import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';

const daysInMonth: number[] = [31,28,31,30,31,30,31,31,30,31,30,31];
const months: string[] = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dateRegex: RegExp = new RegExp("^\\d{1,2}/\\d{1,2}/\\d+$");

let holidayMap: Map<string, string[][]>;
//return the day of the week the month starts on
function getMonthStart(month: number, year: number): number{
    // January and February are counted as months 13 and 14 of the previous year for Zeller's algorithm
    let newMonth: number = month;
    let newYear: number = year;
    if (month <= 1) {
        newMonth += 12;
        newYear -= 1;
    }

    const dayOfWeek = Zeller(newMonth, newYear);
    return (dayOfWeek+ 5) % 7;
   
}

// Zeller's Congruence algorithm
//adopted from: https://en.wikipedia.org/wiki/Zeller%27s_congruence
function Zeller(month: number, year: number): number{
    const q = year % 100; //year of the century
    const y = Math.floor(year / 100); //zero-based century
    return (1 + Math.floor(13 * (month + 2) / 5) + q + Math.floor(q / 4) + Math.floor(y / 4) - 2 * y) % 7;
}



function getHolidayMap(holidayStr: string): Map<string, string[][]> { 

    if (holidayStr != "err"){
        let holidayArray: string[] = [];
        holidayMap = new Map<string, string[][]>();
        holidayArray = holidayStr.split("\n");
        holidayArray.forEach((element) => {
        const holidayRepeat: string[] = element.split(" ");
        const holidayDate: string[] = holidayRepeat[0].split("/");
        const day: string = holidayDate[0];
        const month: string = holidayDate[1];
        const name: string = holidayRepeat[2];
        if(holidayRepeat[1] === "n"){
            if (holidayMap.has(month)) {
                holidayMap.get(month)?.push([day, name]);
    
            }
            else {
                holidayMap.set(month, [[day, name]]);
            }

        }
        else {
            const year: string = holidayDate[2];
            const holidate: string[] = [day, year, name];
            if (holidayMap.has(month)) {
                holidayMap.get(month)?.push(holidate);
    
            }
            else {
                holidayMap.set(month, [holidate]);
            }

        }

    }
    );
    return holidayMap;

    }
    else{
        console.log("cant get holidays");
        return new Map<string, string[][]>();
    }
}

//when page loads get holidays and disable button
$(function(){
    if ($("#months").val() === '') {
    //disable button
    $("#buttonCal").prop("disabled", true);
    $("#buttonCal").addClass("btn-secondary");
    }
    const holidays: Promise<string> = readTextFile("holidays");
    holidays.then((text) => {
         holidayMap = getHolidayMap(text);
    });

}); 

function changeCalendar(monthStart: number, nuDays: number, month: number, year: number): void{
    let monthStr: string = month.toString();
    let hasHoliday: boolean = holidayMap.has(monthStr);    


    let currentDay: number = 1;
    let holidayArr: string[][];
    let tableBody: string = "";


    if(hasHoliday){
        holidayArr = holidayMap.get(monthStr) as string[][];
    }
    else {
        holidayArr = [];
    }

    for(var i = 0; currentDay <= nuDays; i++){ 
        let classStr: string = "";
        let titleStr: string = "";
        if(i % 7 === 0){
            tableBody += "<tr>";
        }
        if (i < monthStart){
            tableBody += "<td></td>";
        }

        //if current day is in the month
        else {
            //check if current day is a holiday
            if (hasHoliday){
                holidayArr.forEach((element) => {
                    if(element.length === 2 && parseInt(element[0]) === currentDay) {
                        classStr = "text-success border border-4 border-success ";
                        titleStr = element[1].replace("-", " ");
                    }
                    else if(element.length === 3 && parseInt(element[0]) === currentDay && parseInt(element[1]) === year){
                        classStr = "text-success border border-4 border-warning ";
                        titleStr = element[2].replace("-", " ");
                    }

                });
            }

            //sunday
            if(i % 7 === 6){
                classStr += "table-danger";
                tableBody += "<td class='" + classStr+ "' title='" + titleStr+ "'>" + currentDay + "</td> </tr>";
            }
            else{
                tableBody += "<td class='" + classStr+ "' title='" + titleStr+ "'>" + currentDay + "</td>";
            }
            currentDay++;

            }
        }
    //add empty cells to fill the row
    while (i % 7 != 0){
        tableBody += "<td></td>";
        if (i % 7 === 6){
            tableBody += "</tr>";
        }
        i++;
    }
    // insert table into html
    $("#bodyCal").html(tableBody);

}

//read text file and return its content as a promise
function readTextFile(file: string): Promise<string> {
    return fetch(file)
      .then((res) => res.text())
      .catch((e) => {
        console.error(e);
        return "err";
      });
  }

//return number of days in a month
function getNuDays(month: number, year: number): number{
    if (month != 1) {
        return daysInMonth[month];
    }
    else {
        //leap year
        if(year % 4 === 0 && year % 100 != 0 || year % 400 === 0) {
            return 29;
        }
        return 28;
    }

    
}

    //autocomplete months

    $("#months").autocomplete({
        source: months,
        minLength: 0 // Set the minimum length to 0 to show all options on click
    }).on("click", function() {
        $(this).autocomplete("search", "");
    });
$(function(){
    $(document).on("change", "#datePick", function(){
        const dateValue: string = $("#datePick").val() as string;
        if(!dateRegex.test(dateValue)){
            $("#errMsg").text("Invalid date format");

        }
        else {
            $("#errMsg").text("");
            const dateArr: string[] = dateValue.split("/");
            const year: number = parseInt(dateArr[2]);
            const month: number = parseInt(dateArr[1]) - 1;
            const nuDays: number = getNuDays(month, year);
            const monthStart: number = getMonthStart(month, year);
            changeCalendar(monthStart, nuDays, month + 1, year);
        }


    });
});


$(function(){
    $(document).on("autocompleteselect", function(){
        $("#buttonCal").prop("disabled", false);
        $("#buttonCal").removeClass("btn-secondary");
        $("#buttonCal").addClass("btn-primary");
    });
});

$(function(){
    $(document).on("click", "#buttonCal", function(){
    
        const year: number = parseInt($("#year").val() as string);
        const month: string = ($("#months").val() as string);
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
            const monthNumber: number = monthMap.get(month) as number;
            const nuDays: number = getNuDays(monthNumber, year);
            const monthStart: number = getMonthStart(monthNumber, year);
            changeCalendar(monthStart, nuDays, monthNumber + 1, year);

          }
          else {
            console.log("cant get month value")

          }



});
});

