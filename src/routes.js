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
    redisClient.hmset("rooms", { [roomId]: JSON.stringify(req.body) });
    redisClient.hmset("managers", { [managerId]: roomId });
    const redirectUrl = `/lecture/${managerId}`;
    res.status(200);
    res.send({ redirectUrl });
});

app.get('/lecture/:id', (req, res) => {
    const _id = req.params.id;
    let is_guest;
    redisClient.hmget('managers', _id, function (err, object) {
        const roomId = object[0];
        is_guest = roomId === null;
        redisClient.hmget('rooms', is_guest ? _id : roomId, function (err, object) {
            const roomObj = object[0]
            if (roomObj) {
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
