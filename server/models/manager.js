class Manager {
  constructor(roomId, email, socketId = null) {
    this.roomId = roomId;
    this.email = email;
    this.socketId = socketId;
  }
}

module.exports = Manager;
