"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
function monthStart(month, year) {
    const dateDay = new Date(year, month, 1);
    // day =  0sunday-6saturday
    let day = dateDay.getDay();
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
    let lastDay = new Date(year, month, 0);
    return lastDay.getDate();
}
//run when page is loaded
(0, jquery_1.default)(function () {
    console.log("ready");
    (0, jquery_1.default)(document).on("blur", "input", function () {
        console.log("change");
        let month, year;
        year = parseInt((0, jquery_1.default)("#year").val());
        month = parseInt((0, jquery_1.default)("#month").val());
        (0, jquery_1.default)("#tableHeader").val(month + " / " + year);
    });
});
