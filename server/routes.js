const app = require('./servers.js').app;
const redisClient = require('./servers.js').client;
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const { logger } = require('./logging/logger');

const public = path.join(__dirname, "../public");

app.get('/', (req, res) => {
    res.sendFile(path.join(public, "index.html"));
});

app.get('/create', (req, res) => {
    res.sendFile("create.html", { root: path.join(public) });
});

app.post('/create', (req, res) => {
    logger.info('POST request received: /create')

    const roomId = uuidv4();
    const managerId = uuidv4();
    logger.info('POST /create roomId generated: ' + roomId);
    logger.info('POST /create managerId generated: ' + managerId);

    let roomObj = req.body;
    console.log(roomObj)
    roomObj.managerId = managerId;
    roomObj.boards = []
    roomObj.boardActive = 0
    redisClient.hmset("rooms", { [roomId]: JSON.stringify(roomObj) });
    redisClient.hmset("managers", {
        [managerId]: JSON.stringify({
            roomId,
            socketId: null
        })
    });

    logger.info('POST /create successfully added room and manager id to redis');
    const redirectUrl = `/lecture/${managerId}`;
    res.status(200);
    res.send({ redirectUrl });
});

app.get('/lecture/:id', (req, res) => {
    const urlId = req.params.id;
    logger.info('GET request received: /lecture for lecture id: ' + urlId);
  
    let is_guest;
    redisClient.hmget('managers', urlId, function (err, object) {
        is_guest = object[0] === null;
        const roomId = !is_guest && JSON.parse(object[0]).roomId;
        redisClient.hexists('rooms', is_guest ? urlId : roomId, function (err, roomExist) {
            if (roomExist) {
                res.sendFile(is_guest ?
                    "lecture.html" : "whiteboard.html",
                    { root: public });
            } else {
                res.status(404).redirect('/')
            }
        });
    });
});

app.get('*', function (req, res) {
    res.status(404).redirect('/');
});
