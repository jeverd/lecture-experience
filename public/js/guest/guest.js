import initializeGuestChat from './guestChat.js';
import { getUrlId, redirectToStats, getStatusColor } from '../utility.js';
import initializeGuestRTC, { changeStatus, disconnectMicrophone } from './guestRTC.js';
import setNonActiveBoards from './guestBoards.js';
import initializeOptionsMenu from './guestOptionsMenu.js';

const nameInput = document.querySelector('#studentName');
const invalidNameDiv = document.getElementById('invalid-student-name');
const hasWhiteboard = $('#whiteboardValidator').val() === 'true';
const roomId = getUrlId();
let studentName;
let currentBoard;

function joinLecture() {
  const socket = io('/', {
    query: `id=${roomId}`,
  });

  window.onbeforeunload = () => {
    socket.emit('send-to-room', roomId, { left: studentName });
    socket.disconnect();
  };

  socket.on('ready', (room) => {
    if (hasWhiteboard) {
      const { boards, boardActive } = room.lecture_details;
      setNonActiveBoards(boards.filter((e, i) => i !== boardActive));
    }
    
    if (!room.lecture_details.isManagerLive) {
      changeStatus.host_disconnected();
    }

    initializeOptionsMenu();
    initializeGuestRTC();
    initializeGuestChat(socket, room.lecture_details.id, studentName);
  });

  socket.on('lectureEnd', () => {
    // Right now only redirect to stats
    // But later we will display a modal saying
    // That the lecture ended and then redirect them.
    redirectToStats(roomId);
  });

  socket.on('disconnect', () => {
    changeStatus.connection_lost();
    document.querySelector('#whiteboard').poster = currentBoard;
  });

  socket.on('managerDisconnected', () => {
    document.querySelector('#whiteboard').poster = currentBoard;
    changeStatus.host_disconnected();
    disconnectMicrophone();
    $('#toggle-mic').removeClass('fa-microphone');
    $('#toggle-mic').addClass('fa-microphone-slash');
  });

  socket.on('updateNumOfStudents', (roomSizeObj) => {
    if (`${roomSizeObj.room}` === `${roomId}`) {
      document.getElementById('specs').innerHTML = roomSizeObj.size;
    }
  });

  socket.on('boards', setNonActiveBoards);

  socket.on('currentBoard', (boardImg) => {
    currentBoard = boardImg;
    if (document.querySelector('#whiteboard').poster) {
      // if poster is defined we don't want to do anything
    } else {
      document.querySelector('#whiteboard').poster = currentBoard;
    }
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
      $('video#whiteboard').parent().addClass('running');

      /*
      joinLecture();
      $('#login-lecture-modal').hide();
      */

      fetch(`/validate/lecture?id=${roomId}`).then((req) => {
        switch (req.status) {
          case 200:
            joinLecture();
            $('#login-lecture-modal').hide();
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
    }
  });

  nameInput.addEventListener('input', () => {
    invalidNameDiv.style.opacity = 0;
  });
};
