const nodemailer = require('nodemailer');
const {
  email,
  emailPassword,
  emailService,
  environment,
} = require('../../config/config');
const { logger } = require('./logger/logger');


const transporter = nodemailer.createTransport({
  service: emailService,
  auth: {
    user: email,
    pass: emailPassword,
  },
});


const sendEmail = (toEmail, subject, htmlBody) => {
  const mailOption = {
    from: email,
    to: toEmail,
    subject,
    html: htmlBody,
  };
  transporter.sendMail(mailOption, (err, info) => {
    if (err) logger.info(`EMAIL: Failed to send email to: ${toEmail}, error: ${err}`);
    else logger.info(`EMAIL: Successfully sent email to ${toEmail}`);
  });
};

// eslint-disable-next-line max-len
const sendManagerDisconnectEmail = (toEmail, id) => { // doesn't matter because its async, since user disconnected
  const subject = 'You disconnected from your lecture, heres your link';
  const host = environment == 'DEVELOPMENT' ? 'localhost' : 'liteboard.io'
  const htmlBody = `<p> Heres your link http://${host}/lecture/${id} <p>`;
  sendEmail(toEmail, subject, htmlBody);
};

module.exports = {
  sendEmail,
  sendManagerDisconnectEmail,
};
