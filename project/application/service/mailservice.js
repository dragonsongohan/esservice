const sgMail = require('@sendgrid/mail');
let config = require('config');
sgMail.setApiKey(config.get('sendgrid.token'));

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

module.exports.sendMail = sendMail;