/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const helmet = require('helmet');
const redis = require('redis');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');
const cookieParser = require('cookie-parser');
const mustache = require('mustache-express');
const Sentry = require('@sentry/node');
const locale = require('locale');

const RedisStore = require('connect-redis')(session);
const {
  redisHost, redisPort, redisTest, expressPort, environment,
  redisUrl, loggerFlag, sessionSecret, sessionName,
  defaultLanguage, supportedLanguages, sentryDSN,
} = require('../config/config');

const { logger } = require('./services/logger/logger');
const { logMiddleWare } = require('./services/logger/loggingMiddleware');


const app = express();

// sentry intergation
Sentry.init({ dsn: sentryDSN, environment });
app.use(Sentry.Handlers.requestHandler());

const expressServer = app.listen(expressPort);


const io = socketio(expressServer, { cookie: false });

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', 'public');
app.use(express.static('public/js'));
app.use(express.static('public/css'));
app.use(express.static('public/images'));
app.use(express.json({ limit: '50mb' }));
app.use(locale(supportedLanguages, defaultLanguage));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
if (loggerFlag) app.use(logMiddleWare);


let client = null;
if (environment === 'DEVELOPMENT') {
  const redisConnect = redisTest ? `redis://${redisHost}:${redisPort}` : `redis://REDIS_PASSWORD_IMPORTANT_KEEP_SAFE@${redisHost}:${redisPort}`;
  client = redis.createClient(redisConnect); // use envir var TODO.
} else {
  app.set('trust proxy', 1); // trust first proxy, if not set, ngnix ip will be considered by same as clients
  client = redis.createClient(redisUrl);
}

const expressSession = session(
  {
    store: new RedisStore({ client }),
    name: sessionName,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: (environment === 'PRODUCTION'),
      sameSite: true,
      domain: (environment === 'PRODUCTION') ? 'liteboard.io' : null,
    },
  },
);
app.use(expressSession);

io.use(sharedSession(expressSession, {
  autoSave: true,
}));

logger.info(`Express and socketio are listening on port: ${expressPort}`);


// client.flushall((err, succeeded) => {
//   logger.info(`Redis status: ${succeeded}`);
// });


client.on('connect', () => {
  logger.info(`Redis connected on port: ${redisPort}`);
});

app.use(Sentry.Handlers.errorHandler());


module.exports = {
  app,
  io,
  client,
};
