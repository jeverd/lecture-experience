/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable no-fallthrough */
/* eslint-disable import/extensions */
import Whiteboard from './classes/whiteboard.js';
import initializeToolsMenu from './tools.js';
import initializeCanvasTopMenu from './canvasTopMenu.js';
import initializeChat from './managerChat.js';
import initModal from './canvasModal.js';
import initializeBoards from './managerBoards.js';
import initializeActionsMenu from './canvasActions.js';
import initializeManagerRTC from './managerRTC.js';
import { getUrlId } from './utility.js';

function beginLecture(stream) {
  const managerId = getUrlId();

  const whiteboard = new Whiteboard('canvas');

  stream.addTrack(whiteboard.getStream().getTracks()[0]);
  const socket = io('/', { query: `id=${managerId}` });

  socket.on('currentBoard', (studentSocketId) => {
    socket.emit('currentBoard', {
      board: whiteboard.getImage(),
      studentSocket: studentSocketId,
    });
  });

  $(window).on('beforeunload', (e) => {
    e.preventDefault();
    socket.disconnect();
  });

  socket.on('ready', (room) => {
    const { boards, boardActive } = room.lecture_details;
    $('[lecture-name]').html(room.lecture_details.name);
    whiteboard.initialize();
    initializeCanvasTopMenu(socket, whiteboard, room.lecture_details.id);
    initializeToolsMenu(whiteboard);
    initializeActionsMenu(socket, whiteboard);
    initializeManagerRTC(room.lecture_details.id, stream);
    initializeBoards(socket, whiteboard, boards, boardActive);
    initializeChat(socket, room.lecture_details.id);
  });
}

window.onload = () => {
  $('#welcome-lecture-modal').show();

  const getUserMedia = navigator.mediaDevices.getUserMedia
                    || navigator.getUserMedia
                    || navigator.webkitGetUserMedia
                    || navigator.mozGetUserMedia
                    || navigator.msGetUserMedia;

  getUserMedia({ audio: true }).then((stream) => {
    initModal(stream);
    $('#modal-select-button').click(() => {
      // call endpoint to validade session
      fetch('/session').then((req) => {
        if (req.status === 200) {
          beginLecture(stream);
          $('#welcome-lecture-modal').hide();
        }
        if (req.status === 401) {
          window.location.replace('/');
        }
      });
    });
  }).catch((error) => {
    // handle error properly here.
    console.log(`Media error: ${error}`);
  });
};
