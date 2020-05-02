const io = require('./servers.js').io;

io.sockets.on('connection', socket => {
    console.log(`socket ${socket.id} connected`)
})