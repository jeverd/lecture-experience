/* eslint-disable no-use-before-define */
/* eslint-disable no-fallthrough */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */
import Whiteboard from './classes/whiteboard.js';
import initializeToolsMenu from './tools.js';
import initializeCanvasTopMenu from './canvasTopMenu.js';
import initializeChat from './managerChat.js';
import initModal from './canvasModal.js';
import initializeBoards from './managerBoards.js';
import initializeActionsMenu from './canvasActions.js';
import { getUrlId } from './utility.js';

window.onload = () => {
  async function beginLecture(stream) {
    const peerjsConfig = await fetch('/peerjs/config').then((r) => r.json());
    const peer = new Peer(peerjsConfig);
    let calls = [];
    const managerId = getUrlId();

    peer.on('open', () => {
      const whiteboard = new Whiteboard('canvas');

      stream.addTrack(whiteboard.getStream().getTracks()[0]);
      const socket = io('/', { query: `id=${managerId}` });
      $(window).on('beforeunload', (e) => {
        e.preventDefault();
        socket.disconnect();
      });
      socket.on('call', (remotePeerId) => {
        const call = peer.call(remotePeerId, stream);
        calls.push(call);
      });

      socket.on('updateNumOfStudents', (num) => {
        document.getElementById('specs').innerHTML = num;
      });

      socket.on('currentBoard', (studentSocketId) => {
        socket.emit('currentBoard', {
          board: whiteboard.getImage(),
          studentSocket: studentSocketId,
        });
      });

      socket.on('attemptToConnectMultipleManagers', () => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        alert('There is already a manager');
      });

      socket.on('ready', (room) => {
        const { boards, boardActive } = room.lecture_details;
        $('[lecture-name]').html(room.lecture_details.name);
        whiteboard.initialize();
        initializeToolsMenu(whiteboard);
        initializeActionsMenu(socket, whiteboard);
        initializeCanvasTopMenu(socket, whiteboard, room.lecture_details.id);
        initializeBoards(socket, whiteboard, boards, boardActive);
        initializeChat(socket, room.lecture_details.id);
      });
    });
  }

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
