const express = require('express');
const helmet = require('helmet');
const redis = require('redis');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const {redisHost, redisPort, expressPort} = require('../config/config')
const app = express();

app.use(express.static('public/js'));
app.use(express.static('public/css'));
app.use(express.static('public/images'));
app.use(bodyParser.json());
app.use(helmet());
const expressServer = app.listen(expressPort);
const io = socketio(expressServer);

console.log(redisPort, redisHost, expressPort);
var client = redis.createClient(redisPort, redisHost);  // use proper .env

>>>>>>> fc21eb6c9fcc880c5fbc7e24bd9f2b59e3432e2b:src/servers.js


console.log('Express and socketio are listening on port 8080');
client.on('connect', function () {
    console.log('Redis client connected on port 6379');  // use proper .env
});

module.exports = {
    app,
    io,
    client
};