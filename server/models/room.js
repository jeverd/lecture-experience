class Room {
  constructor(name, managerId, lectureTools) {
    this.name = name;
    this.managerId = managerId;
    this.boards = [];
    this.boardActive = 0;
    this.lectureTools = lectureTools;
  }
}

module.exports = Room;
