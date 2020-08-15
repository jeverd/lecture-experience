const nodemailer = require('nodemailer');
const Mustache = require('mustache');
const fs = require('fs');
const {
  emailUsername,
  emailSender,
  emailPassword,
  emailService,
  environment,
} = require('../../../config/config');
const { logger } = require('../logger/logger');


const transporter = nodemailer.createTransport({
  service: emailService,
  auth: {
    user: emailUsername,
    pass: emailPassword,
  },
});


const readHtmlFile = (path, cb) => {
  fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
    if (err) {
      cb(err);
    } else {
      cb(null, html);
    }
  });
};


const sendEmail = (toEmail, subject, htmlBody) => {
  const fromEmailFormat = `✏️ Liteboard.io <${emailSender}>`;
  const mailOption = {
    from: fromEmailFormat,
    to: toEmail,
    subject,
    html: htmlBody,
  };
  transporter.sendMail(mailOption, (err) => {
    if (err) logger.info(`EMAIL: Failed to send email to: ${toEmail}, error: ${err}`);
    else logger.info(`EMAIL: Successfully sent email to ${toEmail}`);
  });
};

// eslint-disable-next-line max-len
const sendManagerDisconnectEmail = (toEmail, id) => { // doesn't matter because its async, since user disconnected
  const subject = 'You disconnected from your lecture, heres your link';
  const host = environment === 'DEVELOPMENT' ? 'http://localhost:8080' : 'https://liteboard.io';
  const link = `${host}/lecture/${id}`;
  // now we get the html file
  readHtmlFile(`${__dirname}/templates/disconnectEmail.html`, (err, html) => {
    if (err) {
      logger.error('EMAIL: issue reading html file ');
    } else {
      const renderedHtml = Mustache.render(html, { link });
      sendEmail(toEmail, subject, renderedHtml);
    }
  });
};

module.exports = {
  sendEmail,
  sendManagerDisconnectEmail,
};
