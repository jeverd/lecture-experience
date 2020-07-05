/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable no-fallthrough */
/* eslint-disable import/extensions */
import Whiteboard from '../classes/whiteboard.js';
import initializeToolsMenu from '../tools.js';
import initializeCanvasTopMenu from './canvasTopMenu.js';
import initializeChat from './managerChat.js';
import initializeModal from './canvasModal.js';
import initializeBoards from './managerBoards.js';
import initializeActionsMenu from './canvasActions.js';
import initializeManagerRTC from './managerRTC.js';
import { getUrlId, reloadWindow } from '../utility.js';

const managerId = getUrlId();

function beginLecture(stream) {
  const whiteboard = new Whiteboard('canvas');

  const canvasStream = whiteboard.getStream();
  stream.addTrack(canvasStream.getTracks()[0]);
  const socket = io('/', { query: `id=${managerId}` });

  socket.on('currentBoard', (studentSocketId) => {
    socket.emit('currentBoard', {
      board: whiteboard.getImage(),
      studentSocket: studentSocketId,
    });
  });

  socket.on('attemptToConnectMultipleManagers', () => {
    window.location.replace('/error?code=2');
  });

  $(window).on('beforeunload', (e) => {
    e.preventDefault();
    socket.disconnect();
  });

  socket.on('invalidLecture', reloadWindow);

  socket.on('ready', (room) => {
    const { boards, boardActive } = room.lecture_details;
    whiteboard.initialize();
    initializeCanvasTopMenu(socket, whiteboard, room.lecture_details.id);
    initializeToolsMenu(whiteboard);
    initializeActionsMenu(socket, whiteboard, canvasStream);
    initializeManagerRTC(room.lecture_details.id, stream);
    initializeBoards(socket, whiteboard, boards, boardActive, canvasStream);
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

  getUserMedia({ audio: true, video: true }).then((stream) => {
    initializeModal(stream);
    $('#modal-select-button').click(() => {
      fetch(`/validate/lecture?id=${managerId}`).then((req) => {
        switch (req.status) {
          case 200:
            beginLecture(stream);
            $('#welcome-lecture-modal').hide();
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
    });
  }).catch((error) => {
    // handle error properly here.
    console.log(`Media error: ${error}`);
  });
};
