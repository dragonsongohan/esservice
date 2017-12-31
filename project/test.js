
let Utils = require('./application/utils');
let os = require('os');
let application = require('./application/application');
let config = require('config');
// console.log(os.hostname());

// createGroupEventRequest = {
//     //Event Info of all events create
//     title: String,
//     content: String,
//     userCreate: {},
//     eventImageID: Number,
//     location: String,
//     contextData: {},
//     context: {},
//     isAllDay: Boolean,
//     startTime: Date,//default minDate in options
//     endTime: Date, //default maxDate in options
//     timeCreate: Date,
//     //Recurrent
//     options: {
//         years: [{
//             minDate: Date,
//             maxDate: Date,
//             dates: [
//                 { date: { startTime, endTime } }//
//             ],
//             ignores: [Number],//[xxxx..yyyy]
//             increment: Number,//year+=increment
//         }],
//         months: [{
//             minDate: Date,
//             maxDate: Date,
//             dates: [
//                 { date: { startTime, endTime } },//date[1..31]
//             ],
//             ignores: [Number],//[0..11]
//             increment: Number,//month +=increment
//         }],
//         weeks: [{
//             minDate: Date,
//             maxDate: Date,
//             days: [
//                 { day: { startTime, endTime } },//[0..6]->[su->sa]
//             ],
//             increment: Number,//week+=increment
//         }],
//         days:[{
//             minDate: Date,
//             maxDate: Date,
//             startTime: Date,//only getTime
//             endTime: Date, //only getTime
//             ignore: [Number],//[1..31]
//             increment: Number,//day +=increment
//         }]
//     }
// }


// let strs = "[2017-11-20 14:44:20, 2017-11-20 14:44:20,2017-11-20 14:44:20, 2017-11-20 14:44:20,2017-11-20 14:44:2, 2017-11-20 14:44:20]";
// strs = "[\"1 2\", 2, 3]"
// let s = JSON.parse(strs);
// console.log(s);

let d = Utils.parseDate('01-01-2000Z');
console.log(Utils.exportDate(d));
