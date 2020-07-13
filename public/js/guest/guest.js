/* eslint-disable radix */
/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
import initializeChat from './guestChat.js';
import { getUrlId, redirectToStats } from '../utility.js';
import initializeGuestRTC from './guestRTC.js';

const nameInput = document.querySelector('#studentName');
const invalidNameDiv = document.getElementById('invalid-student-name');
const roomId = getUrlId();
let studentName;

function joinLecture() {
  function setNonActiveBoards(boards) {
    const boardsDiv = document.getElementById('non-active-boards');
    boardsDiv.innerHTML = '';
    boards.forEach((board) => {
      const imgElem = document.createElement('img');
      imgElem.src = board;
      boardsDiv.appendChild(imgElem);
    });
  }
  const socket = io('/', {
    query: `id=${roomId}`,
  });

  window.onbeforeunload = (e) => {
    e.preventDefault();
    socket.disconnect();
  };

  socket.on('ready', (room) => {
    const { boards, boardActive } = room.lecture_details;
    setNonActiveBoards(boards.filter((e, i) => i !== boardActive));
    const roomIdAsInt = parseInt(roomId);
    initializeGuestRTC(roomIdAsInt);
    initializeChat(socket, room.lecture_details.id, studentName);
  });

  socket.on('disconnect', () => {
    // Right now only redirect to stats
    // But later we will display a modal saying
    // That the lecture ended and then redirect them.
    redirectToStats(roomId);
  });

  socket.on('updateNumOfStudents', (num) => {
    document.getElementById('specs').innerHTML = num;
  });

  socket.on('notifyPeerIdToManager', (managerSocketId) => {
    socket.emit('notify', managerSocketId);
  });

  socket.on('boards', setNonActiveBoards);

  socket.on('currentBoard', (board) => {
    document.querySelector('#whiteboard').poster = board;
  });
}

window.onload = async () => {
  $('#modal-select-button').click(() => {
    if (nameInput.value === '') {
      invalidNameDiv.style.opacity = 1;
    } else {
      studentName = nameInput.value;
      joinLecture();
      $('#login-lecture-modal').hide();
      /*
      fetch(`/validate/lecture?id=${roomId}`).then((req) => {
        switch (req.status) {
          case 200:
            break;
          case 404:
            window.location.replace('/error?code=1');
            break;
          case 401:
            window.location.replace('/error?code=2');
            break;
          default: break;
        }
      });
      */
    }
  });

  nameInput.addEventListener('input', () => {
    invalidNameDiv.style.opacity = 0;
  });
};

// document.querySelector('#scroll-up').addEventListener('click', () => {
//   document.querySelector('.page-list').animate({ scrollTop: '-=100' }, 150);
// });

// document.querySelector('#scroll-down').addEventListener('click', () => {
//   document.querySelector('.page-list').animate({ scrollTop: '+=100' }, 150);
// });
