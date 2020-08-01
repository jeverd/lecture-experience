/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable no-fallthrough */
/* eslint-disable import/extensions */
import Whiteboard from '../classes/whiteboard.js';
import initializeToolsMenu from '../tools.js';
import initializeCanvasTopMenu from './canvasTopMenu.js';
import initializeManagerChat from './managerChat.js';
import initializeBoards from './managerBoards.js';
import initializeActionsMenu from './canvasActions.js';
import initializeManagerRTC, { changeStatus } from './managerRTC.js';
import { getUrlId, reloadWindow, copyTextToClipboard } from '../utility.js';

const managerId = getUrlId();
const hasAudio = $('#audioValidator').val() === 'true';
const hasWebcam = $('#webcamValidator').val() === 'true';

function beginLecture(whiteboard, canvasStream) {
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
    initializeBoards(socket, whiteboard, boards, boardActive, canvasStream);
    initializeManagerChat(socket, room.lecture_details.id);
  });
}

window.onload = () => {
  if (!(hasAudio || hasWebcam)) $('#modal-select-button').css('margin-bottom', '30px');
  $('#welcome-lecture-modal').show();

  const whiteboard = new Whiteboard('canvas');
  const canvasStream = whiteboard.getStream();
  const roomId = $('#_id').val();
  changeStatus.starting();
  initializeManagerRTC(roomId, canvasStream, () => {
    $('#modal-select-button').removeClass('live-button-inactive').find('.ld').fadeOut(function () {
      $(this).parent().find('span').fadeIn();
    });

    $('#modal-copy-link').click(function () {
      const copyText = document.querySelector('.modal-url-share');
      copyTextToClipboard(copyText.innerText);
      const range = document.createRange();
      range.selectNodeContents(copyText);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      this.innerHTML = 'Copied!';
      this.style.opacity = 1;
      setTimeout(() => {
        this.style.opacity = 0.83;
        this.innerHTML = 'Copy';
        selection.removeAllRanges();
      }, 2000);
    });


    $('#modal-select-button').click(() => {

      fetch(`/validate/lecture?id=${roomId}`).then((req) => {
        switch (req.status) {
          case 200:
            beginLecture(whiteboard, canvasStream);
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
  });
};
