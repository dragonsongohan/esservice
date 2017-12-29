let events = require('events');
let AnnouncementEvents = new events.EventEmitter();
let UserController = require('../controllers/user');
let MailController = require('../application/service/mailservice');

AnnouncementEvents.on('NewAnnouncement', async function(announcement) {
    // let emails = await UserController.getAllEmails();
    // if (emails.length > 0 && announcement) {
    //     await MailController.sendMail(announcement.userCreate.firstName + ' created new announcement', 'Have new announcement:' + announcement.title, emails);
    // }
    console.log('[NewAnnouncement]Send Mail');
});

module.exports = AnnouncementEvents;