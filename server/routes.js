/* eslint-disable no-shadow */
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { app } = require('./servers');
const redisClient = require('./servers').client;
const { logger } = require('./services/logger/logger');
const credsGenerator = require('./services/credsGenerator');
const Stats = require('./models/stats');
const Manager = require('./models/manager');
const Room = require('./models/room');
const {
  expressPort, environment, turnServerSecret, redisTurnDbNumber,
} = require('../config/config');

const publicPath = path.join(__dirname, '../public');

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/testjanus', (req, res) => {
  res.sendFile('testjanus.html', { root: path.join(publicPath) });
});

app.get('/create', (req, res) => {
  res.sendFile('create.html', { root: path.join(publicPath) });
});

app.post('/create', (req, res) => {
  logger.info('POST request received: /create');
  const managerId = uuidv4();
  const { name, email, roomId } = req.body;
  const newLectureStats = new Stats(name);
  newLectureStats.addUserTrack(new Date(), 0);
  redisClient.hmset('stats', { [roomId]: JSON.stringify(newLectureStats) });
  redisClient.hmset('rooms', { [roomId]: JSON.stringify(new Room(name, managerId)) });
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
        if (isGuest) {
          delete roomJson.managerId;
          res.render('lecture.html', roomJson);
        } else {
          res.render('whiteboard.html', roomJson);
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
  const renderNotFound = () => res.status(404).redirect('/error?code=3');
  redisClient.hexists('rooms', urlId, (er, roomExist) => {
    if (roomExist) {
      // here add the error that the lecture is still under progress
      renderNotFound();
    } else {
      redisClient.hexists('stats', urlId, (er, statsExist) => {
        if (statsExist) {
          res.sendFile('stats.html', { root: path.join(publicPath) });
        } else {
          renderNotFound();
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
    default: break;
  }
  if (errType) {
    res.render('error.html', { [errType]: true });
  } else {
    res.redirect('/');
  }
});

app.get('/turnCreds', (req, res) => {
  redisClient.select(redisTurnDbNumber, (err) => {
    const name = uuidv4();
    if (err) res.status(500).json({ error: `Could not select correct redis db: ${err}` });
    // !!lets not expose the secret!!!
    const { username, password } = credsGenerator(name, turnServerSecret);
    redisClient.set(username, password, (err) => {
      if (err) res.status(500).json({ error: `Couldnot add turn creds to redis: ${err}` });
      console.log(username, password);
      res.json({ username, password, ttl: 86400 }); // 86400 refers to one day, recommended here https://tools.ietf.org/html/draft-uberti-behave-turn-rest-00#section-2
    });
  });
});

app.get('*', (req, res) => {
  res.redirect('/error?code=1');
});
