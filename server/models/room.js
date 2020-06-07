class Room {
  constructor(name, managerId, timeCreated) {
    this.name = name;
    this.managerId = managerId;
    this.timeCreated = timeCreated;
    this.boards = [];
    this.boardActive = 0;
  }
}

module.exports = Room;
