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
    const managerId  = uuidv4();
    redisClient.hmset("rooms",  { [roomId]: JSON.stringify(req.body) } );
    redisClient.hmset("managers",  { [managerId]: roomId } );

    redisClient.hmget('rooms', roomId, function(err, object) {
        console.log("from redis for", roomId);
        console.log(object);
    });
    redisClient.hmget('managers', managerId ,function(err, object) {
        console.log("from redis for", managerId);
        console.log(object)
    });
    const redirectUrl = `/lecture/${managerId}`;
    res.status(200);
    res.send({ redirectUrl });
});

app.get('/lecture/:id', (req, res) => {
    /** 
     * Make redirect based on id.
     * Make call to redis to destinguish 
     * guests and manager.
     */
    const is_guest = false;
    res.sendFile(!is_guest ?
        "whiteboard.html" : "lecture.html",
        { root: public });
});

app.get('*', function (req, res) {
    res.status(404).redirect('/');
});
