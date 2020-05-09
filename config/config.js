const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  expressPort: process.env.EXPRESS_PORT
};