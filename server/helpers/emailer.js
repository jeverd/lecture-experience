const nodemailer = require('nodemailer');
// const { email, emailPassword, emailService } = require('../../config/config');
// const { logger } = require('../logging/logger');


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ece150sucks@gmail.com',
    pass: 'jawad123',
  },
});


const sendEmail = (toEmail, subject, htmlBody) => {
  const mailOption = {
    from: 'ece150sucks@gmail.com',
    to: toEmail,
    subject,
    html: htmlBody,
  };
  transporter.sendMail(mailOption, (err, info) => {
    if (err) console.log(`EMAIL: Failed to send email to: ${toEmail}, error: ${err}`);
    // else logger.info(EMAIL: Successfully sent email to ${toEmail});
  });
};

// eslint-disable-next-line max-len
const sendManagerDisconnectEmail = (toEmail, link) => { // doesn't matter because its async, since user disconnected
  const subject = 'You disconnected from your lecture, heres your link';
  console.log(toEmail);
  const htmlBody = "<p> Heres your link ${link} <p>";
  sendEmail(toEmail, subject, htmlBody);
};

sendManagerDisconnectEmail('jeverd123@gmail.com');

module.exports = {
  sendEmail,
  sendManagerDisconnectEmail,
};