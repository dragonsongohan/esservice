let events = require('events');
let UserEvents = new events.EventEmitter();
let MailController = require('../application/service/mailservice');

UserEvents.on('UpdateInfo', function(user) {
    console.log(user.username + " changed information.");
});

UserEvents.on('NewUserCreate', function(user){
    console.log(user.username + " created.");
});
module.exports = UserEvents;