/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const helmet = require('helmet');
const { ExpressPeerServer } = require('peer');
const redis = require('redis');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');

const RedisStore = require('connect-redis')(session);
const {
  redisHost, redisPort, expressPort, environment, redisUrl, loggerFlag, sessionSecret, sessionName,
} = require('../config/config');
const { logger } = require('./services/logger/logger');
const { logMiddleWare } = require('./services/logger/loggingMiddleware');


const app = express();
const expressServer = app.listen(expressPort);

const io = socketio(expressServer, { cookie: false });


const peerServer = ExpressPeerServer(expressServer);


app.use('/peerjs', peerServer);
app.use(express.static('public/js'));
app.use(express.static('public/css'));
app.use(express.static('public/images'));
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(helmet());
if (loggerFlag) app.use(logMiddleWare);


let client = null;
if (environment === 'DEVELOPMENT') {
  client = redis.createClient(redisPort, redisHost);
  app.set('trust proxy', 1); // trust first proxy, if not set, ngnix ip will be considered by same as clients
} else {
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


client.flushall((err, succeeded) => {
  logger.info(`Redis status: ${succeeded}`);
});


client.on('connect', () => {
  logger.info(`Redis connected on port: ${redisPort}`);
});

module.exports = {
  app,
  io,
  client,
};
