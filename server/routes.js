/* eslint-disable no-shadow */
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  iceServers, expressPort, environment,
} = require('../config/config');
const { app } = require('./servers');
const redisClient = require('./servers').client;
const { logger } = require('./services/logger/logger');
const Stats = require('./models/stats');
const Manager = require('./models/manager');
const Room = require('./models/room');

const publicPath = path.join(__dirname, '../public');

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/create', (req, res) => {
  res.sendFile('create.html', { root: path.join(publicPath) });
});

app.post('/create', (req, res) => {
  logger.info('POST request received: /create');

  const roomId = uuidv4();
  const managerId = uuidv4();
  logger.info(`POST /create roomId generated: ${roomId}`);
  logger.info(`POST /create managerId generated: ${managerId}`);

  const { name, email } = req.body;
  redisClient.hmset('stats', { [roomId]: JSON.stringify(new Stats()) });
  redisClient.hmset('rooms', { [roomId]: JSON.stringify(new Room(name, managerId, new Date())) });
  redisClient.hmset('managers', { [managerId]: JSON.stringify(new Manager(roomId, email)) });

  logger.info('POST /create successfully added room and manager id to redis');
  const redirectUrl = `/lecture/${managerId}`;
  res.status(200);
  res.send({ redirectUrl });
});

app.get('/lecture/:id', (req, res) => {
  const urlId = req.params.id;
  logger.info(`GET request received: /lecture for lecture id: ${urlId}`);
  if (req.session.inRoom) {
    logger.info('SESSION: User already in room for current session');
    res.status(404);
    res.sendFile('error.html', { root: path.join(publicPath) });
  } else {
  redisClient.hmget('managers', urlId, (err, object) => {
    const isGuest = object[0] === null;
    const roomId = !isGuest && JSON.parse(object[0]).roomId;
    redisClient.hexists('rooms', isGuest ? urlId : roomId, (err, roomExist) => {
      if (roomExist) {
        req.session.inRoom = true;
        res.sendFile(isGuest
          ? 'lecture.html' : 'whiteboard.html',
        { root: publicPath });
      } else {
        res.status(404);
        res.sendFile('error.html', { root: path.join(publicPath) });
      }
    });
  });
  }
});

app.get('/lecture/stats/:id', (req, res) => {
  const urlId = req.params.id;
  const renderNotFound = () => res.status(404).sendFile('error.html', { root: path.join(publicPath) });
  redisClient.hexists('rooms', urlId, (er, roomExist) => {
    if (roomExist) {
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
  logger.info(`GET request received: /lecture/stats for lecture id: ${urlId}`);
});

app.get('/peerjs/config', (req, res) => {
  const peerjsConfig = {
    secure: environment === 'PRODUCTION',
    host: environment === 'DEVELOPMENT' ? 'localhost' : 'liteboard.io',
    path: '/peerjs',
    port: environment === 'DEVELOPMENT' ? expressPort : 443,
    iceServers,
  };
  res.send(JSON.stringify(peerjsConfig));
});

app.get('*', (req, res) => {
  res.sendFile('/', { root: path.join(publicPath) });
});
