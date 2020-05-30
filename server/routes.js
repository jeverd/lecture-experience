/* eslint-disable no-shadow */
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { app } = require('./servers.js');
const redisClient = require('./servers.js').client;
const { logger } = require('./logging/logger');

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

  const roomObj = req.body;
  const { email } = roomObj;
  roomObj.managerId = managerId;
  roomObj.boards = [];
  roomObj.boardActive = 0;
  redisClient.hmset('rooms', { [roomId]: JSON.stringify(roomObj) });
  redisClient.hmset('managers', {
    [managerId]: JSON.stringify({
      roomId,
      socketId: null,
      email,
    }),
  });

  logger.info('POST /create successfully added room and manager id to redis');
  const redirectUrl = `/lecture/${managerId}`;
  res.status(200);
  res.send({ redirectUrl });
});

app.get('/lecture/:id', (req, res) => {
  const urlId = req.params.id;
  logger.info(`GET request received: /lecture for lecture id: ${urlId}`);

  let isGuest;
  redisClient.hmget('managers', urlId, (err, object) => {
    isGuest = object[0] === null;
    const roomId = !isGuest && JSON.parse(object[0]).roomId;
    redisClient.hexists('rooms', isGuest ? urlId : roomId, (err, roomExist) => {
      if (roomExist) {
        res.sendFile(isGuest
          ? 'lecture.html' : 'whiteboard.html',
        { root: publicPath });
      } else {
        res.sendFile('error.html', { root: path.join(publicPath) });
      }
    });
  });
});


app.get('*', (req, res) => {
  res.sendFile('/', { root: path.join(publicPath) });
});
