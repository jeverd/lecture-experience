const io = require('./servers.js').io;
const redisClient = require('./servers.js').client;
var roomsTimeout = {}

function updateNumOfStudents(room) {
    io.in(room).clients((error, clients) => {
        io.in(room).emit('updateNumOfStudents', clients.length);
    });
}

function call(room, manager_socket_id, peer_id) {
    io.in(room).connected[manager_socket_id].emit('call', peer_id);
}

io.sockets.on('connection', socket => {
    const urlUuid = socket.handshake.query.id;
    redisClient.hmget('managers', urlUuid, (error, manager) => {
        if (error) {
            console.log('Throwing dbError for client', socket.id)
            socket.emit('dbError')
            return;
        }
        manager = manager.pop(); //redis brings manager as an array
        let roomToJoin, isIncomingStudent;
        if (manager) {
            isIncomingStudent = false;
            let managerObj = JSON.parse(manager);
            roomToJoin = managerObj.roomId;
            if (socket.id != managerObj.sockedId &&
                managerObj.socketId in io.in(roomToJoin).connected) {
                console.log('Attempted to have multiple managers');
                socket.emit('attemptToConnectMultipleManagers');
                return;
            } else {
                if (roomToJoin in roomsTimeout){
                    clearTimeout(roomsTimeout[roomToJoin])
                    delete roomsTimeout[roomToJoin]
                    console.log(`Manager came back -> cleared ${roomToJoin} timeout`)
                }
                function terminateLecture() {
                    console.log(`Ending lecture ${roomToJoin}`)
                    redisClient.hmget('rooms', roomToJoin, (error, roomObj) => {
                        const { managerId } = JSON.parse(roomObj)
                        redisClient.hdel('managers', managerId, (error, success) => null)
                        redisClient.hdel('rooms', roomToJoin, (error, success) => null)
                        const connected_sockets = io.sockets.adapter.rooms[roomToJoin].sockets
                        Object.keys(connected_sockets).forEach(cliId => {
                            if (cliId != socket.id) {
                                io.in(roomToJoin).connected[cliId].disconnect()
                            }
                        })
                    })
                }
                socket.on('disconnect', e => {
                    console.log(`Manager of room ${roomToJoin} disconnected`)
                    managerObj.sockedId = null;
                    redisClient.hmset('managers', {
                        [urlUuid]: JSON.stringify(managerObj)
                    });
                    updateNumOfStudents(roomToJoin)
                    redisClient.hexists('rooms', roomToJoin, (er, roomExist)=>{
                        //Set timeout only if manager disconnected and didn't end lecture
                        if (roomExist){
                            //Terminate lecture if manager is away for 15 minutes.
                            roomsTimeout[roomToJoin] = setTimeout(terminateLecture, 15 * 60 * 1000)
                            console.log(`Timeout on room ${roomToJoin} started`)
                        }
                    })
                });
                socket.on('lectureEnd', terminateLecture)
                socket.on('updateBoards', boardObj => {
                    redisClient.hmget('rooms', roomToJoin, (err, roomObj) => {
                        roomObj = JSON.parse(roomObj)
                        roomObj.boards = boardObj.boards
                        roomObj.boardActive = boardObj.activeBoardIndex
                        redisClient.hmset("rooms", {
                            [roomToJoin]: JSON.stringify(roomObj)
                        })
                        socket.broadcast.to(roomToJoin).emit('boards', 
                        boardObj.boards.filter((e,i)=>{
                            return i != boardObj.activeBoardIndex
                        }))
                    })
                })
                console.log('Initializing room -> manager joining')
                managerObj.socketId = socket.id;
                redisClient.hmset('managers', {
                    [urlUuid]: JSON.stringify(managerObj)
                });
                socket.join(roomToJoin)
                io.of('/').in(roomToJoin).clients((error, clients) => {
                    if (clients.length - 1 > 0) {
                        // if there are students in room -> call them all
                        console.log("Start calling all students already in lecture")
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
            isIncomingStudent = true;
            roomToJoin = urlUuid;
            console.log(`Student joining room ${roomToJoin}`);
            socket.join(roomToJoin);
        }
        updateNumOfStudents(roomToJoin)
        redisClient.hmget('rooms', roomToJoin, (error, roomObj) => {
            let lectureObj = JSON.parse(roomObj);
            lectureObj.id = roomToJoin;
            const { managerId } = lectureObj;
            if (isIncomingStudent) {
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
