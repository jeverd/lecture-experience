class Room {
  constructor(name, managerId) {
    this.name = name;
    this.managerId = managerId;
    this.boards = [];
    this.boardActive = 0;
  }
}

module.exports = Room;
