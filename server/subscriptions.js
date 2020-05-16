const io = require('./servers.js').io;
const redisClient = require('./servers.js').client;
const { logger } = require('./logging/logger');

function updateNumOfStudents(room) {
    io.in(room).clients((error, clients) => {
        io.in(room).emit('updateNumOfStudents', clients.length);
    });
}

function call(room, manager_socket_id, peer_id) {
    io.in(room).connected[manager_socket_id].emit('call', peer_id);
}

io.sockets.on('connection', socket => {
    const _id = socket.handshake.query.id;
    redisClient.hmget('managers', _id, (error, manager) => {
        manager = manager.pop(); // manager comes in array of one item
        if (error) {
            logger.warn(`SOCKET: ON CONNECTION: attempting to get managers from redis- failed, socket_id: ${socket.id} emitting dbError now`);
            socket.emit('dbError');
            return;
        }
        let roomToJoin, is_incoming_student;
        if (manager) {
            logger.info(`SOCKET: ON CONNECTION: manager found, socket_id: ${socket.id}`);
            is_incoming_student = false;
            let managerObj = JSON.parse(manager);
            roomToJoin = managerObj.roomId;
            if (socket.id != managerObj.sockedId &&
                managerObj.socketId in io.in(roomToJoin).connected) {
                logger.warn(`SOCKET: ON CONNECTION: manager already exists, socket_id: ${socket.id}, emitting attemptToConnectMultipleManagers now`);
                socket.emit('attemptToConnectMultipleManagers');
                return;
            } else {
                function terminateLecture() {
                    logger.info(`SOCKET: terminateLecture Function Called: room_id: ${roomToJoin}`)
                    redisClient.hmget('rooms', roomToJoin, (error, roomObj) => {
                        const { managerId } = JSON.parse(roomObj)
                        redisClient.hdel('managers', managerId, (error, success) => null)
                        logger.info(`SOCKET: Successfully deleted manager from redis, managerId: ${managerId}`);
                        redisClient.hdel('rooms', roomToJoin, (error, success) => null)
                        logger.info(`SOCKET: Successfully deleted room from redis, room_id: ${roomToJoin}`);
                        const connected_sockets = io.sockets.adapter.rooms[roomToJoin].sockets
                        Object.keys(connected_sockets).forEach(cli_id => {
                            if (cli_id != socket.id) {
                                io.in(roomToJoin).connected[cli_id].disconnect()
                            }
                        })
                    })
                }
                socket.on('disconnect', e => {
                    logger.info('SOCKET: ON DISCONNECT: trying to find client identity');
                    managerObj.sockedId = null;
                    redisClient.hmset('managers', {
                        [_id]: JSON.stringify(managerObj)
                    });
                    logger.info('SOCKET: ON DISCONNECT: determined manager disconnected, calling updateNumOfStudents now');
                    updateNumOfStudents(roomToJoin)
                });
                socket.on('lectureEnd', terminateLecture)
                managerObj.socketId = socket.id;
                redisClient.hmset('managers', {
                    [_id]: JSON.stringify(managerObj)
                });
                socket.join(roomToJoin)
                io.of('/').in(roomToJoin).clients((error, clients) => {
                    if (clients.length - 1 > 0) {
                        // if there are students in room -> call them all
                        logger.info("SOCKET: start calling all students already in lecture")
                        socket.broadcast.to(roomToJoin).emit('notifyPeerIdToManager', socket.id);
                    }
                })
            }
        } else {
            socket.on('notify', manager_socket_id => {
                // professor have just reconnected -> tell him to call me
                const my_peer_id = socket.handshake.query.peer_id;
                call(roomToJoin, manager_socket_id, my_peer_id)
            })
            socket.on('disconnect', e => updateNumOfStudents(roomToJoin));
            is_incoming_student = true;
            logger.info('SOCKET: student joining room');
            roomToJoin = _id;
            socket.join(roomToJoin);
        }
        updateNumOfStudents(roomToJoin)
        redisClient.hmget('rooms', roomToJoin, (error, roomObj) => {
            let lectureObj = JSON.parse(roomObj);
            lectureObj.id = roomToJoin;
            const { managerId } = lectureObj;
            if (is_incoming_student) {
                delete lectureObj.managerId;
                // notify manager to call incoming student
                redisClient.hmget('managers', managerId, (error, manager) => {
                    let student_peer_id = socket.handshake.query.peer_id;
                    const { socketId } = JSON.parse(manager);
                    if (socketId) {
                        // add incoming student to call
                        call(roomToJoin, socketId, student_peer_id);
                    }
                });
            }
            socket.emit('ready', { lecture_details: lectureObj });
        });
    })
});
