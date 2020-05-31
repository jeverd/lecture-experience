/* eslint-disable no-shadow */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-param-reassign */
const { io } = require('./servers');
const redisClient = require('./servers').client;
const { logger } = require('./services/logger/logger');
const { sendManagerDisconnectEmail } = require('./services/emailer');
const Stats = require('./models/stats');

const roomsTimeout = {};

function updateNumOfStudents(room) {
  io.in(room).clients((error, clients) => {
    const numOfStudents = clients.length + (room in roomsTimeout ? 0 : -1);
    io.in(room).emit('updateNumOfStudents', numOfStudents);
    redisClient.hmget('stats', room, (error, stats) => {
      const { userTracker, maxNumOfUsers, numOfBoards } = JSON.parse(stats);
      const updatedStat = new Stats(userTracker, maxNumOfUsers, numOfBoards);
      updatedStat.addUserTrack(new Date(), clients.length);
      redisClient.hmset('stats', { [room]: JSON.stringify(updatedStat) });
    });
  });
}

function call(room, managerSocketId, peerId) {
  io.in(room).connected[managerSocketId].emit('call', peerId);
}

io.sockets.on('connection', (socket) => {
  const urlUuid = socket.handshake.query.id;
  redisClient.hmget('managers', urlUuid, (error, manager) => {
    if (error) {
      logger.warn(`SOCKET: ON CONNECTION: attempting to get managers from redis- failed, socket_id: ${socket.id} emitting dbError now`);
      socket.emit('dbError');
      return;
    }
    manager = manager.pop(); // redis brings manager as an array
    let roomToJoin; let isIncomingStudent;
    if (manager) {
      logger.info(`SOCKET: ON CONNECTION: manager found, socket_id: ${socket.id}`);
      isIncomingStudent = false;
      const managerObj = JSON.parse(manager);
      roomToJoin = managerObj.roomId;
      if (socket.id !== managerObj.sockedId
        && managerObj.socketId in io.in(roomToJoin).connected) {
        logger.info(`SOCKET: ON CONNECTION: manager already exists, socket_id: ${socket.id}, emitting attemptToConnectMultipleManagers now`);
        socket.emit('attemptToConnectMultipleManagers');
        return;
      }
      if (roomToJoin in roomsTimeout) {
        clearTimeout(roomsTimeout[roomToJoin]);
        delete roomsTimeout[roomToJoin];
        logger.info(`SOCKET: Manager came back -> cleared ${roomToJoin} timeout`);
      }
      function terminateLecture() {
        logger.info(`SOCKET: Lecture ${roomToJoin} terminated`);
        redisClient.hmget('rooms', roomToJoin, (error, roomObj) => {
          const { managerId } = JSON.parse(roomObj);
          redisClient.hdel('managers', managerId);
          logger.info(`SOCKET: Successfully deleted manager from redis, managerId: ${managerId}`);
          redisClient.hdel('rooms', roomToJoin, () => {
            socket.leave(roomToJoin, () => {
              // Call this just to get last piece of stats about this lecture.
              updateNumOfStudents(roomToJoin);
            });
          });
          logger.info(`SOCKET: Successfully deleted room from redis, room_id: ${roomToJoin}`);
          const connectedSockets = io.sockets.adapter.rooms[roomToJoin].sockets;
          Object.keys(connectedSockets).forEach((cliId) => {
            if (cliId !== socket.id) {
              io.in(roomToJoin).connected[cliId].disconnect();
            }
          });
        });
      }
      socket.on('disconnect', () => {
        logger.info(`SOCKET: Manager of room ${roomToJoin} disconnected`);
        managerObj.sockedId = null;
        redisClient.hmset('managers', {
          [urlUuid]: JSON.stringify(managerObj),
        });
        redisClient.hexists('rooms', roomToJoin, (er, roomExist) => {
          // Set timeout only if manager disconnected and didn't end lecture
          if (roomExist) {
            // Terminate lecture if manager is away for 15 minutes.
            roomsTimeout[roomToJoin] = setTimeout(() => {
              const { email } = managerObj;
              sendManagerDisconnectEmail(email, urlUuid);
              roomsTimeout[roomToJoin] = setTimeout(terminateLecture, 15 * 60 * 1000);
            }, 1000 * 60 * 3);
            logger.info(`SOCKET: Timeout on room ${roomToJoin} started`);
          }
        });
      });
      socket.on('lectureEnd', (handleTerminateLectureOnClientManager) => {
        terminateLecture();
        handleTerminateLectureOnClientManager();
      });
      socket.on('updateBoards', (boardObj) => {
        redisClient.hmget('rooms', roomToJoin, (err, roomObj) => {
          roomObj = JSON.parse(roomObj);
          roomObj.boards = boardObj.boards;
          roomObj.boardActive = boardObj.activeBoardIndex;
          redisClient.hmset('rooms', {
            [roomToJoin]: JSON.stringify(roomObj),
          });
          socket.broadcast.to(roomToJoin).emit('boards',
            boardObj.boards.filter((e, i) => i !== boardObj.activeBoardIndex));
        });
      });
      socket.on('currentBoardToAll', (board) => {
        socket.broadcast.to(roomToJoin).emit('currentBoard', board);
      });
      socket.on('currentBoard', (obj) => {
        const { studentSocket, board } = obj;
        io.in(roomToJoin).connected[studentSocket].emit('currentBoard', board);
      });
      logger.info(`SOCKET: Initializing ${roomToJoin}  - manager joined`);
      managerObj.socketId = socket.id;
      redisClient.hmset('managers', {
        [urlUuid]: JSON.stringify(managerObj),
      });
      socket.join(roomToJoin);
      io.of('/').in(roomToJoin).clients((error, clients) => {
        if (clients.length - 1 > 0) {
          // if there are students in room -> call them all
          logger.info('SOCKET: start calling all students already in lecture');
          socket.broadcast.to(roomToJoin).emit('notifyPeerIdToManager', socket.id);
        }
      });
    } else {
      socket.on('notify', (managerSocketId) => {
        // professor have just reconnected -> tell him to call me
        const myPeerId = socket.handshake.query.peer_id;
        call(roomToJoin, managerSocketId, myPeerId);
      });
      roomToJoin = urlUuid;
      socket.on('disconnect', () => updateNumOfStudents(roomToJoin));
      logger.info(`SOCKET: Student joining room ${roomToJoin}`);
      isIncomingStudent = true;
      logger.info(`SOCKET: Student joining room ${roomToJoin}`);
      socket.join(roomToJoin);
      updateNumOfStudents(roomToJoin);
    }
    redisClient.hmget('rooms', roomToJoin, (error, roomObj) => {
      const lectureObj = JSON.parse(roomObj);
      lectureObj.id = roomToJoin;
      const { managerId } = lectureObj;
      if (isIncomingStudent) {
        delete lectureObj.managerId;
        // notify manager to call incoming student
        redisClient.hmget('managers', managerId, (error, manager) => {
          const studentPeerId = socket.handshake.query.peer_id;
          const { socketId } = JSON.parse(manager);
          if (socketId) {
            // Notify prof to send student back the currentBoard
            io.in(roomToJoin).connected[socketId].emit('currentBoard', socket.id);
            // add incoming student to call
            call(roomToJoin, socketId, studentPeerId);
          }
        });
      }
      socket.emit('ready', { lecture_details: lectureObj });
    });
  });
  socket.on('send-to-guests', (room, message) => {
    socket.broadcast.to(room).emit('send-to-guests', message);
  });

  socket.on('send-to-manager', (room, message) => {
    redisClient.hmget('rooms', room, (error, roomObject) => {
      roomObject = JSON.parse(roomObject.pop());
      redisClient.hmget(
        'managers',
        roomObject.managerId,
        (error, managerObject) => {
          const { socketId } = JSON.parse(managerObject.pop());
          io.in(room).connected[socketId].emit('send-to-manager', message);
        },
      );
    });
  });
});
