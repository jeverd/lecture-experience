const winston = require('winston');
const { PapertrailTransport, PapertrailConnection } = require('winston-papertrail');

const { format } = winston;
const {
  combine, timestamp, printf, colorize,
} = format;

const { environment, ptPort, ptHost } = require('../../../config/config');

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

const loggerTransports = [consoleLogger];

if (environment === 'PRODUCTION' || environment === 'STAGING') {
  const papertrailConnection = new PapertrailConnection({
    host: ptHost,
    port: ptPort,
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
  loggerTransports.push(winstonPapertrail);
}

const logger = winston.createLogger({
  transports: loggerTransports,
});

module.exports = {
  logger,
};
