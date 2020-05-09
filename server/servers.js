const express = require('express');
const helmet = require('helmet');
const redis = require('redis');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public/js'));
app.use(express.static('public/css'));
app.use(express.static('public/images'));
app.use(bodyParser.json());
app.use(helmet());
const expressServer = app.listen(8080);
const io = socketio(expressServer);

var client = redis.createClient("6379", "127.0.0.1");  // use proper .env
// DEBUG - delete everything from db
// client.flushall(function (err, succeeded) {
//     console.log(succeeded); // will be true if successfull
// });


console.log('Express and socketio are listening on port 8080');
client.on('connect', function () {
    console.log('Redis client connected on port 6379');  // use proper .env
});

module.exports = {
    app,
    io,
    client
};