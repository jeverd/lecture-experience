/* eslint-disable import/extensions */
/* eslint-disable no-plusplus */
import { getUrlId, buildPostRequestOpts } from './utility.js';

// getSecondsBetweenTwoTimes receives two Date objects
function getSecondsBetweenTwoTimes(start, end) {
  return (end.getTime() - start.getTime()) / 1000;
}

function buildGraph(statsObj) {
  const timeTracks = statsObj.userTracker.map((obj) => obj.time);
  const watchersTracks = statsObj.userTracker.map((obj) => obj.numberOfUser);
  const lectureDurationInSeconds = getSecondsBetweenTwoTimes(new Date(timeTracks[0]),
    new Date(timeTracks[timeTracks.length - 1]));

  const graphSize = 25;

  const timeIntervalInSeconds = lectureDurationInSeconds / graphSize;
  const watchers = Array(graphSize).fill(0);
  const numberOfInputs = Array(graphSize).fill(0);
  const time = Array(timeTracks.length).fill(0);

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

  for (let i = 0; i < graphSize; i++) {
    const progressBar = document.createElement('div');
    progressBar.classList.add('myProgress');
    // setting the class to item and active
    const inner = document.createElement('div');
    inner.classList.add('myBar');
    inner.classList.add('tooltip');

    const popup = document.createElement('div');
    popup.classList.add('tooltiptext');

    const timer = timeIntervalInSeconds * i;

    const hours = Math.floor(timer / 60 / 60);
    const minutes = Math.floor(timer / 60) - (hours * 60);
    const seconds = Number((timer % 60).toPrecision(2));

    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    popup.innerHTML = `Spectators:  ${averageWatchers[i]} <br/> Time:  ${formatted}`;

    inner.appendChild(popup);

    progressBar.appendChild(inner);

    document.getElementById('graph').appendChild(progressBar);
  }


  const elem = document.getElementsByClassName('myBar');

  const maxStudents = Math.max.apply(null, averageWatchers);

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

  document.getElementById('lecture-stats-title').innerHTML = `${statsObj.lectureName.charAt(0).toUpperCase()}${statsObj.lectureName.slice(1)}`;
  document.getElementById('max-specs').innerHTML = maxStudents;
  document.getElementById('max-specss').innerHTML = maxStudents;
  document.getElementById('avg-specs').innerHTML = Math.ceil(averageNumOfUsers / graphSize);
  document.getElementById('boards-used').innerHTML = statsObj.numOfBoards;

  const hours = Math.floor(lectureDurationInSeconds / 60 / 60);
  const minutes = Math.floor(lectureDurationInSeconds / 60) - (hours * 60);
  const seconds = Number((lectureDurationInSeconds % 60).toPrecision(2));

  const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('lecture-duration').innerHTML = formatted;
  document.getElementById('lecture-durationn').innerHTML = formatted;
}

fetch(`/lecture/stats/${getUrlId()}`, buildPostRequestOpts(''))
  .then((response) => {
    if (response.status === 200) {
      response.json().then((jsonResponse) => {
        buildGraph(jsonResponse);
      });
    }
    // else display error loading stats
  });
