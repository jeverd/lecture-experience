/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable-next-line import/extensions */

window.onload = async () => {
  const peerjsConfig = await fetch('/peerjs/config').then((r) => r.json());
  const peer = new Peer(peerjsConfig);
  const url = window.location.pathname;
  const lastSlash = url.lastIndexOf('/');
  const roomId = url.substr(lastSlash + 1);
  const sendContainer = document.getElementById('send-container');
  const messageInput = document.getElementById('message-input');
  const fileInput = document.getElementById('file-input');
  const messageContainer = document.getElementById('message-container');

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
    messageContainer.append(messageElement);

    const messageToggle = document.getElementById('toggle-messages');
    const event = new Event('redraw');
    messageToggle.dispatchEvent(event);
  }

  function appendImage(image) {
    const messageElement = document.createElement('tr');
    const img = document.createElement('img');

    // Doesn't work - need some kind of file upload
    img.src = image;

    messageElement.append(img);
    messageContainer.append(messageElement);

    const messageToggle = document.getElementById('toggle-messages');
    const event = new Event('redraw');
    messageToggle.dispatchEvent(event);
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
    window.onbeforeunload = (e) => {
      e.preventDefault();
      socket.disconnect();
    };

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
      const file = fileInput.value;
      console.log(file);
      if (file === '') {
        appendMessage(`You: ${message}`);
        socket.emit('send-to-manager', roomId, message);
      } else {
        appendMessage(`You: ${message}`);
        appendImage(file);
        // Need to send object with file URL, mime type, and message
        socket.emit('send-to-manager', roomId, message);
      }
      messageInput.value = '';
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
