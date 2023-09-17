import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';

//interface for holiday date and name
interface Holiday {
    day: number;
    name: string;
    year?: number;
}

//consts for calendar
const daysInMonth: number[] = [31,28,31,30,31,30,31,31,30,31,30,31];
const months: string[] = ["January","February","March","April","May","June","July","August","September","October","November","December"];

//regex for date input (dd/mm/yyyy)-> 1 or 2 digits, /, 1 or 2 digits, /, 1 or more digits
const dateRegex: RegExp = new RegExp("^\\d{1,2}/\\d{1,2}/\\d+$");

//map to store holidays: key=month, value= array of holidays(day, name, optional:year)
let holidayMap: Map<number, Holiday[]>;

//return the day of the week the month starts on (0Monday-6Sunday)
function getMonthStart(month: number, year: number): number{
    // January and February are counted as months 13 and 14 of the previous year
    let newMonth: number = month;
    let newYear: number = year;
    if (month <= 1) {
        newMonth += 12;
        newYear -= 1;
    }
    //returns 0Saturday-6Friday
    const dayOfWeek = Zeller(newMonth, newYear);
    return (dayOfWeek + 5) % 7;
   
}

// Zeller's Congruence algorithm
//adopted from: https://en.wikipedia.org/wiki/Zeller%27s_congruence
function Zeller(month: number, year: number): number{
    const q = year % 100; //year of the century
    const y = Math.floor(year / 100); //zero-based century
    return (1 + Math.floor(13 * (month + 2) / 5) + q + Math.floor(q / 4) + Math.floor(y / 4) - 2 * y) % 7;
}


//return a map of holidays: key=month, value= array of holidays(day, name, optional:year) from a string of holidays
function getHolidayMap(holidayStr: string): Map<number, Holiday[]> { 

    if (holidayStr != "err"){

        //map to store holidays: key=month, value= array of holidays(day, name, optional:year)
        let holidayMapResult = new Map<number, Holiday[]>();
        const holidayArray = holidayStr.split("\n");

        //split each holiday string
        holidayArray.forEach((element) => {

        //split into: (date, type, name)
        const holidayInfo: string[] = element.split(" ");

        //split date into: (day, month, year: optional)
        const holidayDate: string[] = holidayInfo[0].split("/");
        const day: number = parseInt(holidayDate[0]);
        const month: number = parseInt(holidayDate[1]);
        const name: string = holidayInfo[2];

        //create holiday object
        let holidate: Holiday = {day: day, name: name};

        //holiday only occurs on a specific year
        if(holidayInfo[1] === "p"){
            const year: number = parseInt(holidayDate[2]);
            holidate.year = year;
        }
        //add holiday to correct month
        if (holidayMapResult.has(month)) {
            holidayMapResult.get(month)?.push(holidate);
        }
        else {
            //create new Holiday array
            holidayMapResult.set(month, [holidate]);
        }

    }
    );
    return holidayMapResult;

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
    //fill holidays map with holidays from text file (async)
    const holidays: Promise<string> = readTextFile("holidays");
    holidays.then((text) => {
         holidayMap = getHolidayMap(text);
    }).catch((e) => {
        console.error("Error loading holidays",e);
    });

}); 

//change calendar to display the selected month and year
function changeCalendar(monthStart: number, nuDays: number, month: number, year: number): void{
    //check if selected month has holidays
    const hasHoliday: boolean = holidayMap.has(month);    

    //counter for current day to be displayed
    let currentDay: number = 1;
    let holidayArr: Holiday[] = [];

    //table to be inserted into html
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

        //if current day should be displayed
        else {

        //check if current day is a holiday
        if (hasHoliday) {
            for (let i = 0; i < holidayArr.length; i++) {
                const element = holidayArr[i];
                if (element.day === currentDay) {

                    //repeating holiday
                    if (!element.hasOwnProperty("year")) {
                        classStr = "text-success border border-4 border-success ";
                        titleStr = element.name.replace("-", " ");

                    //holiday only occurs on a specific year
                    } else if (element.year === year) {
                        classStr = "text-success border border-4 border-warning ";
                        titleStr = element.name.replace("-", " ");
                    }
                    //we found the currentDay holiday, break out of loop (we assume there is only one holiday per day)
                    break;
                }
            }
        }
            //sunday (end row)
            if(i % 7 === 6){
                classStr += "table-danger";
                //add class and title to cell
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
            $("#x-button").attr("title", "show calendar");

            tableVisible = false;
        }
        else {
            $("#calendar").show();
            $("#minimise").text("X");
            $("#x-button").attr("title", "minimise calendar");

            tableVisible = true;
        }
    });
});

//change calendar based on selected month and year when button is clicked
$(function(){
    $(document).on("click", "#buttonCal", function(){
    
        //get input values
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
          const monthNumber: number | undefined = monthMap.get(month);  
          if(monthNumber != undefined) {
            //get month values, change calendar
            const nuDays: number = getNuDays(monthNumber, year);
            const monthStart: number = getMonthStart(monthNumber, year);
            changeCalendar(monthStart, nuDays, monthNumber + 1, year);

          }
          else {
            console.log("cant get month value")

          }



});
});

