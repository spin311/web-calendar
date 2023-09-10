"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jquery_1 = require("jquery");
function monthStart(month, year) {
    var dateDay = new Date(year, month, 1);
    // day =  0sunday-6saturday
    var day = dateDay.getDay();
    //want to return 0 for monday and 6 for sunday
    if (day === 0) {
        return 6;
    }
    else {
        return (day - 1);
    }
}
function changeCalendar(month, year) {
}
//return number of days in a month
function getNuDays(month, year) {
    var lastDay = new Date(year, month, 0);
    return lastDay.getDate();
}
(0, jquery_1.default)(document).ready(function () {
    console.log("ready");
    (0, jquery_1.default)("input").on('change', function () {
        console.log("change");
        var month, year;
        year = parseInt((0, jquery_1.default)("#year").val());
        month = parseInt((0, jquery_1.default)("#month").val());
        (0, jquery_1.default)("#tableHeader").val(month + " / " + year);
    }, false);
});
