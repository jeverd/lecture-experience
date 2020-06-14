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
  console.log(statsObj);
  const timeTracks = statsObj.userTracker.map((obj) => obj.time);
  const watchersTracks = statsObj.userTracker.map((obj) => obj.numberOfUser);
  const lectureDurationInSeconds = getSecondsBetweenTwoTimes(new Date(timeTracks[0]),
    new Date(timeTracks[timeTracks.length - 1]));

 console.log(lectureDurationInSeconds);

  let graphSize;

  if (lectureDurationInSeconds > 1800) {
    graphSize = 20;
  } else {
    graphSize = 10;
  }

  for (let i = 0; i < graphSize; i++) {
    const proressBar = document.createElement('div');
    proressBar.classList.add('myProgress');
    // setting the class to item and active
    const inner = document.createElement('div');
    inner.classList.add('myBar');

    proressBar.appendChild(inner);

    document.getElementById('graph').appendChild(proressBar);
  }

  const timeIntervalInSeconds = lectureDurationInSeconds / graphSize;
  const watchers = Array(graphSize).fill(0);
  const numberOfInputs = Array(graphSize).fill(0);
  const time = Array(timeTracks.length).fill(0);

  console.log(timeIntervalInSeconds);

  for (let i = 0; i < timeTracks.length; i++) {
    time[i] = getSecondsBetweenTwoTimes(new Date(timeTracks[0]),
      new Date(timeTracks[i]));
  }

  for (let i = 1; i < watchersTracks.length - 1; i++) {
    const index = Math.floor(time[i] / timeIntervalInSeconds);
    if (watchersTracks[i] === 0) {
      watchers[index] += watchersTracks[i];
    } else {
      watchers[index] += watchersTracks[i] - 1;
    }
    // watchers[index] += watchersTracks[i];
    numberOfInputs[index] += 1;
  }

  const averageWatchers = [];

  console.log(averageWatchers);

  console.log(time);

  for (let i = 0; i < graphSize; i++) {
    if (watchers[i] === 0) {
      if (i === 0) {
        averageWatchers[i] = 0;
      } else if (numberOfInputs[i] === 0) {
        averageWatchers[i] = averageWatchers[i - 1];
      } else {
        averageWatchers[i] = 0;
      }
    } else {
      averageWatchers[i] = Math.ceil(watchers[i] / numberOfInputs[i]);
    }
  }


  const elem = document.getElementsByClassName('myBar');

  const maxStudents = Math.max.apply(null, averageWatchers);

  console.log(averageWatchers);

  for (let i = 0; i < graphSize; i++) {
    if (averageWatchers[i] === 0) {
      elem[i].style.height = `${1}%`;
    } else {
      elem[i].style.height = `${(averageWatchers[i] / maxStudents) * 100}%`;
    }
  }

  let averageNumOfUsers = 0;
  for (let i = 0; i < graphSize; i++) {
    averageNumOfUsers += averageWatchers[i];
  }

  document.getElementById('lecture-stats-title').innerHTML = statsObj.lectureName;
  document.getElementById('max-specs').innerHTML = maxStudents;
  document.getElementById('avg-specs').innerHTML = Math.ceil(averageNumOfUsers / graphSize);
  document.getElementById('boards-used').innerHTML = statsObj.numOfBoards;

  const hours = Math.floor(lectureDurationInSeconds / 60 / 60);
  const minutes = Math.floor(lectureDurationInSeconds / 60) - (hours * 60);
  const seconds = Number((lectureDurationInSeconds % 60).toPrecision(2));

  const formatted = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
  document.getElementById('lecture-duration').innerHTML = formatted;
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
