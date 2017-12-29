const sgMail = require('@sendgrid/mail');
let config = require('config');
let Users = require('./models/user');
sgMail.setApiKey(config.get('sendgrid.token'));

async function getEmails() {
    let users = await Users.find({isDeleted: false, email:{$ne: null}}, {email:1, _id: 0});
    let emails = users.map(user => user.email);
    return emails;
}

async function sendMail(subject, content, emails) {
    const msg = {
        to: emails,
        from: config.get("sendgrid.from"),
        subject: subject,
        text: content,
        html: '<strong>' + content + '</strong>',
    };
    await sgMail.send(msg);
}

Application.events.announcement.on('NewAnnouncement', async function(announcement) {
    let emails = await getEmails();
    if (emails.length > 0 && announcement) {
        await sendMail(announcement.userCreate.firstName + 'created new announcement', 'Have new announcement:' + announcement.title, emails);
    }
});