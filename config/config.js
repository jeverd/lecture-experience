const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, './.env') }); // requires providing full path, due to some issues with dotenv and node versions

module.exports = {
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  expressPort: process.env.EXPRESS_PORT,
  environment: process.env.NODE_ENV,
  ptHost: process.env.PT_HOST,
  ptPort: process.env.PT_PORT,
  redisUrl: process.env.REDIS_URL,
  email: process.env.EMAIL,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailService: process.env.EMAIL_SERVICE,
  loggerFlag: (process.env.LOGGER === 'true'),
};
