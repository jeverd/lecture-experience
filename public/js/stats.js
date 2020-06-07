/* eslint-disable no-plusplus */

const url = window.location.pathname;
const lastSlash = url.lastIndexOf('/');
const urlId = url.substr(lastSlash + 1);
const requestOpts = {
  method: 'POST',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
};

// getSecondsBetweenTwoTimes receives two Date objects
function getSecondsBetweenTwoTimes(start, end) {
  return (end.getTime() - start.getTime()) / 1000;
}

function buildGraph(statsObj) {
  const timeTracks = statsObj.userTracker.map((obj) => obj.time);
  const watchersTracks = statsObj.userTracker.map((obj) => obj.numberOfUser);
  const lectureDurationInSeconds = getSecondsBetweenTwoTimes(new Date(timeTracks[0]),
    new Date(timeTracks[timeTracks.length - 1]));

  // const lectureDurationInMinutes = Math.ceil(lectureDurationInSeconds / 60);
  const timeIntervalInSeconds = lectureDurationInSeconds / 10;
  const watchers = Array(10).fill(0);
  const average = Array(10).fill(0);
  const time = Array(10).fill(0);

  for (let i = 0; i < timeTracks.length; i++) {
    time[i] = getSecondsBetweenTwoTimes(new Date(timeTracks[0]),
      new Date(timeTracks[i]));
  }

  for (let i = 1; i < watchersTracks.length - 1; i++) {
    const index = Math.floor(time[i] / timeIntervalInSeconds);

    if (index <= (i)) {
      watchers[index] += watchersTracks[i];
      average[index] += 1;
    }
  }

  const averageWatchers = [];

  for (let i = 0; i < 10; i++) {
    if (watchers[i] === 0) {
      if (i === 0) {
        averageWatchers[i] = 0;
      } else if (average[i] === 0) {
        averageWatchers[i] = averageWatchers[i - 1];
      } else {
        averageWatchers[i] = 0;
      }
    } else {
      averageWatchers[i] = Math.ceil(watchers[i] / average[i]);
    }
  }

  const elem = document.getElementsByClassName('myBar');

  const maxStudents = Math.max.apply(null, averageWatchers);

  for (let i = 0; i < 10; i++) {
    if (averageWatchers[i] === 0) {
      elem[i].style.height = `${1}%`;
    } else {
      elem[i].style.height = `${(averageWatchers[i] / maxStudents) * 100}%`;
    }
  }
}

fetch(`/lecture/stats/${urlId}`, requestOpts)
  .then((response) => {
    if (response.status === 200) {
      response.json().then((jsonResponse) => {
        buildGraph(jsonResponse);
      });
    }
    // else display error loading stats
  });
