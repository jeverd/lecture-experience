/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable-next-line import/extensions */
import { CONFIG } from './peerConfig.js';

window.onload = () => {
  const peer = new Peer(CONFIG);
  const url = window.location.pathname;
  const lastSlash = url.lastIndexOf('/');
  const roomId = url.substr(lastSlash + 1);
  const sendContainer = document.getElementById('send-container');
  const messageInput = document.getElementById('message-input');

  function setNonActiveBoards(boards) {
    const boardsDiv = document.getElementById('non-active-boards');
    boardsDiv.innerHTML = '';
    boards.forEach((board) => {
      const imgElem = document.createElement('img');
      imgElem.src = board;
      imgElem.height = 75;
      boardsDiv.appendChild(imgElem);
    });
  }

  function appendMessage(message) {
    const messageElement = document.createElement('tr');
    const tableData = document.createElement('td');
    tableData.innerText = message;

    messageElement.append(tableData);
    sendContainer.append(messageElement);
  }

  function startStream(htmlElem, streamTrack) {
    const stream = new MediaStream();
    stream.addTrack(streamTrack);
    htmlElem.srcObject = stream;
    if ('srcObject' in htmlElem) {
      htmlElem.srcObject = stream;
    } else {
      htmlElem.src = window.URL.createObjURL(stream);
    }
  }

  peer.on('open', (peerId) => {
    const socket = io('/', {
      query: `id=${roomId}&peer_id=${peerId}`,
    });

    socket.on('ready', (room) => {
      const { boards, boardActive } = room.lecture_details;
      setNonActiveBoards(boards.filter((e, i) => i !== boardActive));
    });

    socket.on('disconnect', (e) => {
      console.log(e);
    });

    socket.on('updateNumOfStudents', (num) => {
      document.getElementById('specs').innerHTML = num;
    });

    socket.on('notifyPeerIdToManager', (managerSocketId) => {
      socket.emit('notify', managerSocketId);
    });

    socket.on('send-to-guests', (message) => {
      appendMessage(`Manager: ${message}`);
    });

    socket.on('boards', setNonActiveBoards);

    socket.on('currentBoard', (board) => {
      document.querySelector('#whiteboard').poster = board;
    });

    peer.on('call', (call) => {
      call.on('stream', (stream) => {
        const speaker = document.getElementById('speaker');
        const whiteboard = document.getElementById('whiteboard');
        startStream(speaker, stream.getAudioTracks()[0]);
        startStream(whiteboard, stream.getVideoTracks()[0]);
      });
      call.answer(null);
    });

    sendContainer.addEventListener('submit', (e) => {
      e.preventDefault();

      const message = messageInput.value;
      appendMessage(`You: ${message}`);
      socket.emit('send-to-manager', roomId, message);
      messageInput.value = '';
    });
  });
};
