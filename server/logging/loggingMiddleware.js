const morgan = require('morgan'); // http logging middleware
const { logger } = require('./logger');


logger.stream = {
  write: (message) => logger.info(message.substring(0, message.lastIndexOf('\n'))),
};


module.exports = {

  logMiddleWare: morgan(
    ':method :url :status :response-time ms - :res[content-length]',
    { stream: logger.stream },
  ),
};
