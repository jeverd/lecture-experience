const io = require('./servers.js').io;

io.sockets.on('connection', socket => {
    console.log(`socket ${socket.id} connected`)
})

io.of('/guest').on('connection', socket => {
    console.log(`socket ${socket.id} connected as guest`)
})