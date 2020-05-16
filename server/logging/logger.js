const winston = require('winston');
const { PapertrailConnection, PapertrailTransport } = require('winston-papertrail');

const { format } = winston;
const {
  combine, timestamp, printf, colorize,
} = format;


console.log('Called logger');
const { environment } = require('../../config/config');

const consoleFormat = printf(({
  // eslint-disable-next-line no-shadow
  level, message, timestamp,
}) => `${timestamp}: ${level}: ${message}`);

const consoleLogger = new winston.transports.Console({
  level: 'debug',
  format: combine(
    colorize(),
    timestamp(),
    consoleFormat,
  ),
});


const logger = winston.createLogger({ // both production, staging and dev enviroments allow for this
  transports: [consoleLogger],
});


if (environment === 'PRODUCTION' || environment === 'STAGING') {
  const papertrailConnection = new PapertrailConnection({
    host: 'logs6.papertrailapp.com',
    port: '29341',
  });

  const winstonPapertrail = new PapertrailTransport(papertrailConnection, {
    inlineMeta: true,
    level: 'debug',
    logFormat(level, message) {
      // eslint-disable-next-line prefer-template
      return '[' + level + ']: ' + message;
    },
    colorize: true,
  });
  logger.transports.push(winstonPapertrail);
}


module.exports = {
  logger,
};
