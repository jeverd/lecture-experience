const io = require('./servers.js').io;
const redisClient = require('./servers.js').client;

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
            console.log('throwing dbError for client', socket.id)
            socket.emit('dbError')
            return;
        }
        let roomToJoin, is_incoming_student;
        if (manager) {
            is_incoming_student = false;
            let managerObj = JSON.parse(manager);
            roomToJoin = managerObj.roomId;
            console.log(roomToJoin)
            if (socket.id != managerObj.sockedId &&
                managerObj.socketId in io.in(roomToJoin).connected) {
                console.log('attempted to have multiple managers');
                socket.emit('attemptToConnectMultipleManagers');
                return;
            } else {
                socket.on('disconnect', e => {
                    managerObj.sockedId = null;
                    redisClient.hmset('managers', {
                        [_id]: JSON.stringify(managerObj)
                    });
                    updateNumOfStudents(roomToJoin)
                });
                console.log('initializing room >> manager joining')
                managerObj.socketId = socket.id;
                redisClient.hmset('managers', {
                    [_id]: JSON.stringify(managerObj)
                });
                const connected_students = Object.keys(io.in(roomToJoin).connected);
                socket.join(roomToJoin);
                if (connected_students.length - 1 > 0) {
                    // if there are students in room -> call them all
                    socket.broadcast.to(roomToJoin).emit('notifyPeerIdToManager', peer_id => {
                        call(roomToJoin, socket.id, peer_id)
                    });
                }
            }
        } else {
            socket.on('disconnect', e => updateNumOfStudents(roomToJoin));
            is_incoming_student = true;
            console.log('student joining room');
            roomToJoin = _id;
            socket.join(roomToJoin);
        }
        updateNumOfStudents(roomToJoin)
        redisClient.hmget('rooms', roomToJoin, (error, roomObj) => {
            let lectureObj = JSON.parse(roomObj);
            lectureObj.id = roomToJoin;
            const { managerId } = lectureObj;
            delete lectureObj.managerId;
            socket.emit('ready', { lecture_details: lectureObj });
            if (is_incoming_student) {
                // notify manager to call incoming student
                redisClient.hmget('managers', managerId, (error, manager) => {
                    console.log(socket.handshake.query)
                    let student_peer_id = socket.handshake.query.peer_id;
                    const { socketId } = JSON.parse(manager);
                    if (socketId) {
                        // add incoming student to call
                        call(roomToJoin, socketId, student_peer_id);
                    }
                });
            }
        });
    })
});
