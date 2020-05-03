const express = require('express');
const helmet = require('helmet');
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

console.log('Express and socketio are listening on port 8080');

module.exports = {
    app,
    io
};