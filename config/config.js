const dotenv = require('dotenv');
const path = require('path');

const SUPPORTED_LANGUAGES = [
  'pt', 'pt-BR', 'pt-PT', 'en-US',
];

dotenv.config({ path: path.resolve(__dirname, './.env') }); // requires providing full path, due to some issues with dotenv and node versions

module.exports = {
  redisPort: process.env.REDIS_PORT,
  expressPort: process.env.EXPRESS_PORT,
  environment: process.env.NODE_ENV,
  ptHost: process.env.PT_HOST,
  ptPort: process.env.PT_PORT,
  redisUrl: process.env.REDIS_URL,
  emailUsername: process.env.EMAIL_USERNAME,
  emailSender: process.env.EMAIL_SENDER,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailService: process.env.EMAIL_SERVICE,
  loggerFlag: (process.env.LOGGER === 'true'),
  sessionSecret: process.env.SESSION_SECRET,
  sessionName: process.env.SESSION_NAME,
  redisTurnDbNumber: process.env.REDIS_TURN_DB_NUMBER,
  turnServerSecret: process.env.TURN_SERVER_SECRET,
  turnServerPort: process.env.TURN_SERVER_PORT,
  turnServerActive: (process.env.TURN_SERVER_ACTIVE === 'true'),
  turnServerUrl: process.env.TURN_SERVER_URL,
  defaultLanguage: process.env.DEFAULT_LANGUAGE,
  supportedLanguages: SUPPORTED_LANGUAGES,
  sentryDSN: process.env.SENTRY_DSN,
  sentryEnvironment: process.env.SENTRY_ENVIRONMENT,
  janusServerSecret: process.env.JANUS_SERVER_SECRET,
  debugClient: process.env.DEBUG_CLIENT,
};
