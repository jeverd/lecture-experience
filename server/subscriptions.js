/* eslint-disable no-shadow */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-param-reassign */
const { io } = require('./servers');
const redisClient = require('./servers').client;
const { logger } = require('./services/logger/logger');
const { sendManagerDisconnectEmail } = require('./services/emailer/emailer');
const Stats = require('./models/stats');


const roomsTimeout = {};

function updateNumOfStudents(room) {
  io.in(room).clients((error, clients) => {
    const numOfStudents = clients.length + (room in roomsTimeout ? 0 : -1);
    io.in(room).emit('updateNumOfStudents', numOfStudents);
    redisClient.hmget('stats', room, (error, stats) => {
      stats = stats.pop();
      logger.info(`STATS: adding stats on room ${room}`);
      if (stats) {
        const {
          lectureName, userTracker, maxNumOfUsers, numOfBoards,
        } = JSON.parse(stats);
        const updatedStat = new Stats(lectureName, userTracker, maxNumOfUsers, numOfBoards);
        updatedStat.addUserTrack(new Date(), clients.length);
        redisClient.hmset('stats', { [room]: JSON.stringify(updatedStat) });
      }
    });
  });
}

io.sockets.on('connection', (socket) => {
  const urlUuid = socket.handshake.query.id;
  socket.handshake.session.inRoom = true;
  socket.handshake.session.save();
  const deleteSession = () => {
    if (socket.handshake.session.inRoom) {
      delete socket.handshake.session.inRoom;
      socket.handshake.session.save();
    }
  };
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
          roomObj = roomObj.pop();
          if (roomObj) {
            const { managerId } = JSON.parse(roomObj);
            redisClient.hdel('managers', managerId);
            logger.info(`SOCKET: Successfully deleted manager from redis, managerId: ${managerId}`);
            redisClient.hdel('rooms', roomToJoin, () => {
              socket.leave(roomToJoin, () => {
                // Call this just to get last piece of stats about this lecture.
                updateNumOfStudents(roomToJoin);
                logger.info(`SOCKET: Successfully deleted room from redis, room_id: ${roomToJoin}`);
                io.to(roomToJoin).emit('lectureEnd');
                if (roomToJoin in io.sockets.adapter.rooms) {
                  const connectedSockets = io.sockets.adapter.rooms[roomToJoin].sockets;
                  Object.keys(connectedSockets).forEach((cliId) => {
                    if (cliId !== socket.id && cliId in io.in(roomToJoin).connected) {
                      io.in(roomToJoin).connected[cliId].disconnect();
                    }
                  });
                }
              });
            });
          }
        });
      }
      socket.on('disconnect', deleteSession);
      socket.on('disconnecting', () => {
        logger.info(`SOCKET: Manager of room ${roomToJoin} disconnected`);
        managerObj.sockedId = null;
        deleteSession();
        redisClient.hmset('managers', {
          [urlUuid]: JSON.stringify(managerObj),
        });
        socket.broadcast.to(roomToJoin).emit('managerDisconnected');
        redisClient.hexists('rooms', roomToJoin, (er, roomExist) => {
          // Set timeout only if manager disconnected and didn't end lecture
          if (roomExist) {
            // Terminate lecture if manager is away for 15 minutes.
            roomsTimeout[roomToJoin] = setTimeout(() => {
              const { email } = managerObj;
              if (email !== '') {
                sendManagerDisconnectEmail(email, urlUuid);
              } else {
                logger.info(`EMAIL: Not sending email to manager of room ${roomToJoin} as no email was provided`);
              }
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
          roomObj = roomObj.pop();
          if (roomObj) {
            roomObj = JSON.parse(roomObj);
            roomObj.boards = boardObj.boards;
            roomObj.boardActive = boardObj.activeBoardIndex;
            redisClient.hmset('rooms', {
              [roomToJoin]: JSON.stringify(roomObj),
            });
            socket.broadcast.to(roomToJoin).emit('boards', boardObj.boards.reduce((boardImgs, board, i) => {
              if (i !== boardObj.activeBoardIndex) boardImgs.push(board.image);
              return boardImgs;
            }, []));
          }
        });
      });
      socket.on('currentBoardToAll', (boardImg) => {
        socket.broadcast.to(roomToJoin).emit('currentBoard', boardImg);
      });
      socket.on('currentBoard', (obj) => {
        const { studentSocket, boardImg } = obj;
        if (studentSocket in io.in(roomToJoin).connected) {
          io.in(roomToJoin).connected[studentSocket].emit('currentBoard', boardImg);
        }
      });
      logger.info(`SOCKET: Initializing ${roomToJoin}  - manager joined`);
      managerObj.socketId = socket.id;
      redisClient.hmset('managers', {
        [urlUuid]: JSON.stringify(managerObj),
      });

      socket.join(roomToJoin);
    } else {
      roomToJoin = urlUuid;
      socket.on('disconnect', () => {
        deleteSession();
        updateNumOfStudents(roomToJoin);
      });
      logger.info(`SOCKET: Student joining room ${roomToJoin}`);
      isIncomingStudent = true;
      socket.join(roomToJoin);
    }
    redisClient.hmget('rooms', roomToJoin, (error, roomObj) => {
      logger.info(`SOCKET: Retreiving room object on room ${roomToJoin}`);
      roomObj = roomObj.pop();
      if (roomObj) {
        const lectureObj = JSON.parse(roomObj);
        lectureObj.id = roomToJoin;
        const { managerId } = lectureObj;
        if (isIncomingStudent) {
          delete lectureObj.managerId;
          lectureObj.boards = lectureObj.boards.map((board) => board.image);
          // notify manager to about incoming student
          redisClient.hmget('managers', managerId, (error, manager) => {
            manager = manager.pop();
            if (manager) {
              const { socketId } = JSON.parse(manager);
              if (socketId in io.in(roomToJoin).connected) {
                // Notify prof to send student back the currentBoard
                io.in(roomToJoin).connected[socketId].emit('currentBoard', socket.id);
              }
            }
          });
        }
        socket.emit('ready', { lecture_details: lectureObj });
        updateNumOfStudents(roomToJoin);
      } else {
        socket.emit('invalidLecture');
      }
    });
  });

  socket.on('send-to-room', (room, message) => {
    socket.broadcast.to(room).emit('send-to-room', message);
  });

  /* I'll comeback to this later!
  socket.on('send-to-guests', (room, message) => {
    socket.broadcast.to(room).emit('send-to-guests', message);
  });

  socket.on('send-to-manager', (room, message) => {
    redisClient.hmget('rooms', room, (error, roomObject) => {
      roomObject = roomObject.pop();
      if (roomObject) {
        roomObject = JSON.parse(roomObject);
        redisClient.hmget(
          'managers',
          roomObject.managerId,
          (error, managerObject) => {
            managerObject = managerObject.pop();
            if (managerObject) {
              const { socketId } = JSON.parse(managerObject);
              if (socketId in io.in(room).connected) {
                io.in(room).connected[socketId].emit('send-to-manager', message);
              }
            }
          },
        );
      }
    });
  });
  */
});
