// let Utils = require('./application/utils');

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


// periods:"[\"2017-11-20 14:44:21\",\"2017-11-20 14:44:22\",\"2017-11-20 14:44:23\",\"2017-11-20 14:44:24\",\"2017-11-20 14:44:25\",\"2017-11-20 14:44:26\"]"

let GenderEnum = {
    0: "None",
    1: "Male",
    2: "Female"
};

console.log(GenderEnum['1a']);