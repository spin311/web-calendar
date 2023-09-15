import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';

//consts for calendar
const daysInMonth: number[] = [31,28,31,30,31,30,31,31,30,31,30,31];
const months: string[] = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dateRegex: RegExp = new RegExp("^\\d{1,2}/\\d{1,2}/\\d+$");
let holidayMap: Map<number, Holiday[]>;

interface Holiday {
    day: number;
    name: string;
    year?: number;
}

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


//return a map of holidays: key=month, value= array of holidays(day, name, optional:year)
function getHolidayMap(holidayStr: string): Map<number, Holiday[]> { 

    if (holidayStr != "err"){
        let holidayArray: string[] = [];
        holidayMap = new Map<number, Holiday[]>();
        holidayArray = holidayStr.split("\n");

        //split each holiday into an array of [date, name]
        holidayArray.forEach((element) => {
        const holidayRepeat: string[] = element.split(" ");
        const holidayDate: string[] = holidayRepeat[0].split("/");
        const day: number = parseInt(holidayDate[0]);
        const month: number = parseInt(holidayDate[1]);
        const name: string = holidayRepeat[2];
        let holidate: Holiday = {day: day, name: name};
        //holiday only occurs on a specific year
        if(holidayRepeat[1] === "p"){
            const year: number = parseInt(holidayDate[2]);
            holidate.year = year;
        }
        if (holidayMap.has(month)) {
            holidayMap.get(month)?.push(holidate);
        }
        else {
            holidayMap.set(month, [holidate]);
        }

    }
    );
    return holidayMap;

    }
    else{
        console.log("cant get holidays");
        return new Map<number, Holiday[]>();
    }
}

//when page loads get holidays map and disable button
$(function(){
    if ($("#months").val() === '') {
    //disable button, gray out
    $("#buttonCal").prop("disabled", true);
    $("#buttonCal").addClass("btn-secondary");
    }
    const holidays: Promise<string> = readTextFile("holidays");
    holidays.then((text) => {
         holidayMap = getHolidayMap(text);
    });

}); 

//change calendar to display the month and year
function changeCalendar(monthStart: number, nuDays: number, month: number, year: number): void{
    let hasHoliday: boolean = holidayMap.has(month);    


    let currentDay: number = 1;
    let holidayArr: Holiday[] = [];
    let tableBody: string = "";


    if(hasHoliday){
        holidayArr = holidayMap.get(month) as Holiday[];
    }

    for(var i = 0; currentDay <= nuDays; i++){ 
        //variables for class and title of cell
        let classStr: string = "";
        let titleStr: string = "";
        //new week
        if(i % 7 === 0){
            tableBody += "<tr>";
        }
        //add empty cells to fill the row
        if (i < monthStart){
            tableBody += "<td></td>";
        }

        //if current day is in the month
        else {
            //check if current day is a holiday
            if (hasHoliday){
                holidayArr.forEach((element) => {
                    if(!element.hasOwnProperty("year") && element.day === currentDay) {
                        classStr = "text-success border border-4 border-success ";
                        titleStr = element.name.replace("-", " ");
                    }


                    else if(element.hasOwnProperty("year") && element.day === currentDay && element.year === year){
                        classStr = "text-success border border-4 border-warning ";
                        titleStr = element.name.replace("-", " ");
                    }

                });
            }

            //sunday (end row)
            if(i % 7 === 6){
                classStr += "table-danger";
                tableBody += "<td class='" + classStr+ "' title='" + titleStr+ "'>" + currentDay + "</td> </tr>";
            }
            //other days
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
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
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

    //autocomplete months input
    $("#months").autocomplete({
        source: months,
        minLength: 0 // Set the minimum length to 0 to show all options on click
    }).on("click", function() {
        $(this).autocomplete("search", "");
    });

//date input
$(function(){

    $(document).on("change", "#datePick", function(){
        const dateValue: string = $("#datePick").val() as string;

        //check if date is valid
        if(!dateRegex.test(dateValue)){
            $("#errMsg").text("Invalid date format");

        }

        //get date values, change calendar
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

//enable button when month is selected
$(function(){
    $(document).on("autocompleteselect", function(){
        $("#buttonCal").prop("disabled", false);
        $("#buttonCal").removeClass("btn-secondary");
        $("#buttonCal").addClass("btn-primary");
    });
});

//minimise or expand calendar
$(function(){
    let tableVisible: boolean = true;
    $(document).on("click", "#minimise", function(){
        if(tableVisible){
            $("#calendar").hide();
            $("#minimise").text("^");
            $("#minimise").attr("title", "show calendar");

            tableVisible = false;
        }
        else {
            $("#calendar").show();
            $("#minimise").text("X");
            $("#minimise").attr("title", "minimise calendar");

            tableVisible = true;
        }
    });
});

//change calendar based on selected month and year when button is clicked
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
            //get input values, change calendar
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

