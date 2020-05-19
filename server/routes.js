const app = require('./servers.js').app;
const redisClient = require('./servers.js').client;
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const public = path.join(__dirname, "../public");

app.get('/', (req, res) => {
    res.sendFile(path.join(public, "index.html"));
});

app.get('/create', (req, res) => {
    res.sendFile("create.html", { root: path.join(public) });
});

app.post('/create', (req, res) => {
    const roomId = uuidv4();
    const managerId = uuidv4();
    let roomObj = req.body;
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
    const redirectUrl = `/lecture/${managerId}`;
    res.status(200);
    res.send({ redirectUrl });
});

app.get('/lecture/:id', (req, res) => {
    const urlId = req.params.id;
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
