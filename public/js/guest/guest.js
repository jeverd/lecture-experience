/* eslint-disable radix */
/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
import initializeChat from './guestChat.js';
import { getUrlId, redirectToStats, getStatusColor } from '../utility.js';
import initializeGuestRTC from './guestRTC.js';
import initializeOptionsMenu from './guestOptionsMenu.js';
import initializeTopMenu from './guestTopMenu.js';

const nameInput = document.querySelector('#studentName');
const invalidNameDiv = document.getElementById('invalid-student-name');
const roomId = getUrlId();
let studentName;
let currentBoard;

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
    initializeOptionsMenu();
    initializeGuestRTC(roomIdAsInt);
    initializeTopMenu();
    initializeChat(socket, room.lecture_details.id, studentName);
  });

  socket.on('lectureEnd', () => {
    // Right now only redirect to stats
    // But later we will display a modal saying
    // That the lecture ended and then redirect them.
    redirectToStats(roomId);
  });

  socket.on('disconnect', () => {
    $('#lecture-status .status-dot').css('background', getStatusColor('connection_lost'));
    $('#lecture-status .status-text').html($('#status-connection-lost').val());
  });

  socket.on('managerDisconnected', () => {
    $('video#whiteboard').replaceWith('<video class="whiteboard" id="whiteboard" playsinline autoplay muted ></video>');
    document.querySelector('#whiteboard').poster = currentBoard;
    $('#lecture-status .status-dot').css('background', getStatusColor('host_disconnected'));
    $('#lecture-status .status-text').html($('#status-host-disconnected').val());
  });

  socket.on('updateNumOfStudents', (num) => {
    document.getElementById('specs').innerHTML = num;
  });

  socket.on('boards', setNonActiveBoards);

  socket.on('currentBoard', (board) => {
    currentBoard = board;
    document.querySelector('#whiteboard').poster = currentBoard;
  });
}

window.onload = async () => {
  $('#modal-select-button').click(() => {
    if (nameInput.value === '') {
      invalidNameDiv.style.opacity = 1;
    } else {
      studentName = nameInput.value;
      $('#lecture-status .status-dot').css('background', getStatusColor('starting'));
      $('#lecture-status .status-text').html($('#status-starting').val());
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
