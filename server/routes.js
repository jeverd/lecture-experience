/* eslint-disable no-shadow */
const { v4: uuidv4 } = require('uuid');
const Sentry = require('@sentry/node');
const { app } = require('./servers');
const redisClient = require('./servers').client;
const { logger } = require('./services/logger/logger');
const credsGenerator = require('./services/credsGenerator');
const Stats = require('./models/stats');
const Manager = require('./models/manager');
const Room = require('./models/room');
const {
  expressPort, environment, turnServerSecret, redisTurnDbNumber, turnServerActive, turnServerPort, turnServerUrl,  sentryDSN, sentryEnvironment,
} = require('../config/config');

const { getLanguage, setLanguage } = require('./services/i18n/i18n');


app.get('/', (req, res) => {
  res.render('index.html', { sentryDSN, sentryEnvironment, ...getLanguage(req.cookies, req.locale) });
});

app.get('/create', (req, res) => {
  res.render('create.html', { sentryDSN, sentryEnvironment, ...getLanguage(req.cookies, req.locale) });
});

app.post('/create', (req, res) => {
  logger.info('POST request received: /create');
  const managerId = uuidv4();
  const {
    name, email, roomId, lectureTools,
  } = req.body;
  const newLectureStats = new Stats(name);
  newLectureStats.addUserTrack(new Date(), 0);
  redisClient.hmset('stats', { [roomId]: JSON.stringify(newLectureStats) });
  redisClient.hmset('rooms', { [roomId]: JSON.stringify(new Room(name, managerId, lectureTools)) });
  redisClient.hmset('managers', { [managerId]: JSON.stringify(new Manager(roomId, email)) });

  logger.info('POST /create successfully added room and manager id to redis');
  const redirectUrl = `/lecture/${managerId}`;
  res.status(200);
  res.send({ redirectUrl });
});

app.get('/validate/lecture', (req, res) => {
  logger.info(`GET request received: /validate/lecture for sessionId ${req.sessionId}`);
  redisClient.hexists('managers', req.query.id, (err, roomExist) => {
    if (roomExist) {
      if (req.session.inRoom) {
        res.status(401);
        res.json({ error: 'User already connected on different tab' });
      } else {
        res.status(200);
        res.json({ success: 'User is ready to be connected' });
      }
    } else {
      res.status(404);
      res.json({ error: 'Lecture does not exist' });
    }
  });
});

app.get('/lecture/:id', (req, res) => {
  const urlId = req.params.id;
  logger.info(`GET request received: /lecture for lecture id: ${urlId}`);

  redisClient.hmget('managers', urlId, (err, object) => {
    const isGuest = object[0] === null;
    const roomId = !isGuest && JSON.parse(object[0]).roomId;
    redisClient.hmget('rooms', isGuest ? urlId : roomId, (err, room) => {
      let roomJson = room.pop();
      if (err === null && roomJson !== null) {
        roomJson = JSON.parse(roomJson);
        const host = environment === 'DEVELOPMENT' ? `http://localhost:${expressPort}` : 'https://liteboard.io';
        const sharableUrl = `${host}/lecture/${roomId}`;
        roomJson.id = roomId;
        roomJson.sharableUrl = sharableUrl;
        const objToRender = {
          sentryDSN, sentryEnvironment, ...roomJson, ...getLanguage(req.cookies, req.locale),
        };
        if (isGuest) {
          delete roomJson.managerId;
          res.render('lecture.html', objToRender);
        } else {
          res.render('whiteboard.html', objToRender);
        }
      } else {
        res.status(404);
        res.redirect('/error?code=3');
      }
    });
  });
});

app.get('/lecture/stats/:id', (req, res) => {
  const urlId = req.params.id;
  logger.info(`GET request received: /lecture/stats for lecture id: ${urlId}`);
  redisClient.hexists('rooms', urlId, (er, roomExist) => {
    if (roomExist) {
      res.status(404).redirect('/error?code=4');
    } else {
      redisClient.hexists('stats', urlId, (er, statsExist) => {
        if (statsExist) {
          res.render('stats.html', { sentryDSN, sentryEnvironment, ...getLanguage(req.cookies, req.locale) });
        } else {
          res.status(404).redirect('/error?code=3');
        }
      });
    }
  });
});

app.post('/lecture/stats/:id', (req, res) => {
  const urlId = req.params.id;
  logger.info(`POST request received: /lecture/stats for lecture id: ${urlId}`);
  redisClient.hmget('stats', urlId, (err, statsJson) => {
    if (err === null) {
      res.send(statsJson.pop());
    } else {
      res.status(404);
    }
  });
});

app.get('/error', (req, res) => {
  let errType;
  switch (req.query.code) {
    case '0': errType = null; break;
    case '1': errType = 'PageNotFound'; break;
    case '2': errType = 'InvalidSession'; break;
    case '3': errType = 'LectureNotFound'; break;
    case '4': errType = 'LectureInProgress'; break;
    default: break;
  }
  if (errType) {
    res.render('error.html', {
      [errType]: true, sentryDSN, sentryEnvironment, ...getLanguage(req.cookies, req.locale),
    });
  } else {
    res.redirect('/');
  }
});

app.get('/turnCreds', (req, res) => {
  if (!turnServerActive) {
    // it was a success, but server is not active, so notifying client to not use turn servers.
    res.json({ active: false });
  } else {
    redisClient.select(redisTurnDbNumber, (err) => {
      const name = uuidv4();
      const uri = environment === 'DEVELOPMENT' ? `turn:localhost:${turnServerPort}` : `turn:${turnServerUrl}:${turnServerPort}`;

      if (err) res.status(500).json({ error: `Could not select correct redis db: ${err}` });
      // !!lets not expose the secret!!!
      const { username, password } = credsGenerator(name, turnServerSecret);
      redisClient.set(username, password, (err) => {
        if (err) res.status(500).json({ error: `Couldnot add turn creds to redis: ${err}` });
        res.json({
          username, password, ttl: 86400, uri, active: true,
        }); // 86400 refers to one day, recommended here https://tools.ietf.org/html/draft-uberti-behave-turn-rest-00#section-2
      });
    });
  }
});
app.get('/setLanguage', (req, res) => {
  setLanguage((key, value) => res.cookie(key, value), req.query.langCode);
  res.redirect(req.query.pageRef || '/');
});

app.get('*', (req, res) => {
  res.redirect('/error?code=1');
});

// error handling middleware, have to specify here, refer to docs https://docs.sentry.io/platforms/node/express/, error handlers should always be defined last
app.use(Sentry.Handlers.errorHandler()); // will capture any statusCode of 500
