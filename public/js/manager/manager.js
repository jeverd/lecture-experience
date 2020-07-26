/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable no-fallthrough */
/* eslint-disable import/extensions */
import Whiteboard from '../classes/whiteboard.js';
import initializeToolsMenu from '../tools.js';
import initializeCanvasTopMenu from './canvasTopMenu.js';
import initializeManagerChat from './managerChat.js';
import initializeModal from './canvasModal.js';
import initializeBoards from './managerBoards.js';
import initializeActionsMenu from './canvasActions.js';
import initializeManagerRTC, { changeStatus } from './managerRTC.js';
import { getUrlId, reloadWindow } from '../utility.js';

const managerId = getUrlId();
const hasAudio = $('#audioValidator').val() === 'true';
const hasWebcam = $('#webcamValidator').val() === 'true';

function beginLecture(stream) {
  changeStatus.starting();
  const whiteboard = new Whiteboard('canvas');

  const canvasStream = whiteboard.getStream();

  stream = stream || canvasStream;

  const socket = io('/', { query: `id=${managerId}` });

  socket.on('currentBoard', (studentSocketId) => {
    socket.emit('currentBoard', {
      boardImg: whiteboard.getImage(),
      studentSocket: studentSocketId,
    });
  });

  socket.on('disconnect', changeStatus.connection_lost);

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
    initializeCanvasTopMenu(socket, room.lecture_details.id);
    initializeToolsMenu(whiteboard);
    initializeActionsMenu(socket, whiteboard, canvasStream);
    initializeManagerRTC(room.lecture_details.id, stream, canvasStream);
    initializeBoards(socket, whiteboard, boards, boardActive, canvasStream);
    initializeManagerChat(socket, room.lecture_details.id);
  });
}

window.onload = () => {
  if (!(hasAudio || hasWebcam)) $('#modal-select-button').css('margin-bottom', '30px');
  $('#welcome-lecture-modal').show();
  const isWebcamActive = document.getElementById('webcam') !== null;
  const isAudioActive = document.getElementById('audio') !== null;
  const start = (stream = null) => {
    initializeModal(stream);
    $('#modal-select-button').click(() => {
      $('#welcome-lecture-modal').hide();
      const roomId = $('#_id').val();
      fetch(`/validate/lecture?id=${roomId}`).then((req) => {
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
  };
  if (isWebcamActive || isAudioActive) {
    navigator.mediaDevices.getUserMedia({ audio: isAudioActive, video: isWebcamActive })
      .then(start)
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: `<strong style="font-size: 1.2rem">${$('#swal-title').val()}</strong>`,
          html: `<div style="font-size: .9rem; opacity: .85;">
            ${$('#swal-text').val()}
          </div>`,
          confirmButtonColor: 'rgba(70, 194, 255, 1)',
          confirmButtonText: 'Ok',
          showClass: {
            popup: 'animate__animated animate__fadeIn',
          },
          footer: `
            <a style="color: gray; text-decoration: none;" href="https://getacclaim.zendesk.com/hc/en-us/articles/360001547832-Setting-the-default-camera-on-your-browser">
              <i class="fa fa-question-circle" aria-hidden="true"></i> ${$('#swal-help').val()}
            </a>`,
        }).then(reloadWindow);
      });
  } else start();
};
