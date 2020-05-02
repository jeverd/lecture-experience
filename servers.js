const express = require('express')
const helmet = require('helmet')
const socketio = require('socket.io')

const app = express()
app.use(helmet())
const expressServer = app.listen(8080)
const io = socketio(expressServer)

console.log('Express and socketio are listening on port 8080')

module.exports = {
    app,
    io
}