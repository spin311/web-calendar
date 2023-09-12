import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';

const daysInMonth: number[] = [31,28,31,30,31,30,31,31,30,31,30,31];
const months: string[] = ["January","February","March","April","May","June","July","August","September","October","November","December"];
//return the day of the week the month starts on
function getMonthStart(month: number, year: number): number{
    // January and February are counted as months 13 and 14 of the previous year
    let newMonth: number = month;
    if (month <= 1) {
        newMonth += 12;
        year -= 1;
    }

    const dayOfWeek = Zeller(newMonth, year);
    return (dayOfWeek+ 5) % 7;
   
}

// Zeller's Congruence algorithm
//adopted from: https://en.wikipedia.org/wiki/Zeller%27s_congruence
function Zeller(month: number, year: number): number{
    const q = year % 100; //year of the century
    const y = Math.floor(year / 100); //zero-based century
    return (1 + Math.floor(13 * (month + 2) / 5) + q + Math.floor(q / 4) + Math.floor(y / 4) - 2 * y) % 7;
}

function getHolidayMap(holidayStr: string): Map<number, number[]> { 

    if (holidayStr != "err"){
        let holidayArray: string[] = [];
        let holidayMap = new Map<number, number[]>();
        holidayArray = holidayStr.split("\n");
        holidayArray.forEach((element, index) => {
        let holidayDate: number[];
        const holidayRepeat: string[] = element.split(" ");
        holidayDate = holidayRepeat[0].split("/").map(Number);
        const day: number = holidayDate[0];
        const month: number = holidayDate[1];
        if (holidayMap.has(month)) {
            holidayMap.get(month)?.push(day);

        }
        else {
            holidayMap.set(month, [day]);
        }
    }
    );
    return holidayMap;

    }
    else{
        console.log("cant get holidays");
        return new Map<number, number[]>();
    }
}
let holidayMap: Map<number, number[]>;

//when page loads get holidays and disable button
$(function(){
    console.log($("#months").val());
    if ($("#months").val() === '') {
    //disable button
    $("#buttonCal").prop("disabled", true);
    //give buttton disabled bootstrap class
    $("#buttonCal").addClass("btn-secondary");
    }
    const holidays: Promise<string> = readTextFile("holidays");
    holidays.then((text) => {
         holidayMap = getHolidayMap(text);
    });

}); 

function changeCalendar(monthStart: number, nuDays: number, month: number): void{
   
    let hasHoliday: boolean = holidayMap.has(month);    


    let currentDay: number = 1;
    let holidayArr: number[] = [];
    let table: string = `
    <table class="table table-info table-width tableCal">
            <thead>
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


    if(hasHoliday){
        holidayArr = holidayMap.get(month) as number[];
    }
    for(var i = 0; currentDay <= nuDays; i++){ 
        let classStr: string = "";
        if(i % 7 === 0){
            table += "<tr>";
        }
        if (i < monthStart){
            table += "<td></td>";
        }

        //if current day is in the month
        else {
            //check if current day is a holiday
            if (hasHoliday){
                if (holidayArr.includes(currentDay)){
                    classStr = "text-success border border-4 border-success ";
                }
            }

            //sunday
            if(i % 7 === 6){
                classStr += "table-danger";
                table += "<td class='" + classStr+ "'>" + currentDay + "</td> </tr>";
            }
            else{
                table += "<td class='" + classStr+ "'>" + currentDay + "</td>";
            }
            currentDay++;

            }
        }
    //add empty cells to fill the row
    while (i % 7 != 0){
        table += "<td></td>";
        if (i % 7 === 6){
            table += "</tr>";
        }
        i++;
    }
    table += "</tbody></table>";
    // insert table into html
    $("#calendar").html(table);

}

//read text file and return its content as a promise
function readTextFile(file: string): Promise<string> {
    return fetch(file)
      .then((res) => res.text())
      .then((text) => {
        return text;
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
        const dateArr: string[] = dateValue.split("-");
        const year: number = parseInt(dateArr[0]);
        const month: number = parseInt(dateArr[1]) - 1;
        const nuDays: number = getNuDays(month, year);
        const monthStart: number = getMonthStart(month, year);
        changeCalendar(monthStart, nuDays, month + 1);

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
            changeCalendar(monthStart, nuDays, monthNumber + 1);

          }
          else {
            console.log("cant get month value")

          }



});
});

