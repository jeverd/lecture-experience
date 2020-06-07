const morgan = require('morgan'); // http logging middleware
const { logger } = require('./logger');


logger.stream = {
  write: (message) => logger.info(message.substring(0, message.lastIndexOf('\n'))),
};


module.exports = {

  logMiddleWare: morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url" :status :res[content-length]',
    { stream: logger.stream },
  ),
};
