import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';

//return the day of the week the month starts on
function getMonthStart(month: number, year: number): number{
    const dateDay: Date = new Date(year, month, 1);

    // day =  0sunday-6saturday
    let day: number = dateDay.getDay();
    //return 0 for monday and 6 for sunday
    if (day === 0){
        return 6;
    }
    else{
        return (day-1);
    }
   
}

function getHolidayMap(holidayStr: string): Map<number, number[]> { 

    if (holidayStr != "err"){
        let holidayArray: string[] = [];
        let holidayMap = new Map<number, number[]>();
        holidayArray = holidayStr.split("\n");
        holidayArray.forEach((element, index) => {
        let holidayDate: number[];
        let holidayRepeat: string[] = element.split(" ");
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
$(function(){
    let holidays: Promise<string> = readTextFile("holidays");
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

//read text file and return its content
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
    let lastDay: Date = new Date(year, month + 1, 0);
    return lastDay.getDate();
}

    //autocomplete months
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
            changeCalendar(monthStart, nuDays, monthNumber + 1);

          }
          else {
            console.log("cant get month value")

          }



});
});

