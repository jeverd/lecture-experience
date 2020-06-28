/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
import Chat from './classes/Chat.js';
import Message from './classes/Message.js';
import { getUrlId } from './utility.js';

window.onload = async () => {
  const peerjsConfig = await fetch('/peerjs/config').then((r) => r.json());
  const peer = new Peer(peerjsConfig);
  const roomId = getUrlId();
  const sendContainer = document.getElementById('send-container');
  const messageInput = document.getElementById('message-input');
  const fileInput = document.getElementById('file-input');

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
    const chat = new Chat('message-container');
    const socket = io('/', {
      query: `id=${roomId}&peer_id=${peerId}`,
    });
    window.onbeforeunload = (e) => {
      e.preventDefault();
      socket.disconnect();
    };

    socket.on('ready', (room) => {
      const { boards, boardActive } = room.lecture_details;
      setNonActiveBoards(boards.filter((e, i) => i !== boardActive));

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
      chat.appendMessage(message, true);
      // if (file) appendFile(file, fileType, fileName, 'receiver');
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
  });
};
