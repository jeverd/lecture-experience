class Stats {
  constructor(lectureName, userTracker = [], maxNumOfUsers = 0, numOfBoards = 1) {
    this.userTracker = userTracker;
    this.maxNumOfUsers = maxNumOfUsers;
    this.numOfBoards = numOfBoards;
    this.lectureName = lectureName;
  }

  addUserTrack(time, numberOfUser) {
    const userTrack = {
      time,
      numberOfUser,
    };
    this.userTracker.push(userTrack);
    if (numberOfUser > this.maxNumOfUsers) {
      this.maxNumOfUsers = numberOfUser;
    }
  }
}

module.exports = Stats;
