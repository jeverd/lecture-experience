/* eslint-disable radix */
/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
import Chat from '../classes/Chat.js';
import Message from '../classes/Message.js';
import { getUrlId, redirectToStats } from '../utility.js';
import initializeGuestRTC from './guestRTC.js';

const nameInput = document.querySelector('#studentName');
const invalidNameDiv = document.getElementById('invalid-student-name');
const roomId = getUrlId();

function joinLecture() {
  const sendContainer = document.getElementById('send-container');
  const messageInput = document.getElementById('message-input');
  const fileInput = document.getElementById('file-input');

  function setNonActiveBoards(boards) {
    const boardsDiv = document.getElementById('non-active-boards');
    boardsDiv.innerHTML = '';
    boards.forEach((board) => {
      const imgElem = document.createElement('img');
      imgElem.classList.add('pages-img');
      imgElem.src = board;
      boardsDiv.appendChild(imgElem);
    });
  }
  const chat = new Chat('message-container');
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

    sendContainer.addEventListener('submit', (e) => {
      e.preventDefault();
      const messageContent = messageInput.value;
      const newFile = document.getElementById('file-input').files[0];
      const message = new Message(messageContent, newFile);
      socket.emit('send-to-manager', room.lecture_details.id, message);
      chat.appendMessage(message, false);
      messageInput.value = '';
      fileInput.value = '';
    });
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

  socket.on('send-to-guests', (message) => {
    chat.appendMessage(message, true);
    // if (file) appendFile(file, fileType, fileName, 'receiver');
  });

  socket.on('boards', setNonActiveBoards);

  socket.on('currentBoard', (board) => {
    document.querySelector('#whiteboard').poster = board;
  });

  document.querySelector('button#toggle-messages').addEventListener('click', (e) => {
    e.preventDefault();

    const messagesChild = e.target.nextElementSibling;
    e.target.classList.toggle('active-chat');
    if (messagesChild.style.maxHeight) {
      messagesChild.style.maxHeight = null;
    } else {
      messagesChild.style.maxHeight = `${messagesChild.scrollHeight}px`;
    }
  });
  document.querySelector('button#toggle-messages').addEventListener('redraw', (e) => {
    e.preventDefault();

    const messagesChild = e.target.nextElementSibling;
    e.target.classList.add('active-chat');
    if (messagesChild.scrollHeight >= 300) {
      messagesChild.style.maxHeight = '300px';
      messagesChild.style.overflow = 'scroll';
    } else {
      messagesChild.style.maxHeight = `${messagesChild.scrollHeight}px`;
    }
  });
}

window.onload = async () => {
  $('#modal-select-button').click(() => {
    const studentName = nameInput.value;
    if (studentName === '') {
      invalidNameDiv.style.opacity = 1;
    } else {
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

document.querySelector('#scroll-up').addEventListener('click', () => {
  document.querySelector('.page-list').animate({ scrollTop: '-=100' }, 150);
});

document.querySelector('#scroll-down').addEventListener('click', () => {
  document.querySelector('.page-list').animate({ scrollTop: '+=100' }, 150);
});
