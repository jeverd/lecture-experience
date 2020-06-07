/* eslint-disable no-use-before-define */
/* eslint-disable no-fallthrough */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */
import Whiteboard from './classes/whiteboard.js';
import initializeToolsMenu from './tools.js';

window.onload = async () => {
  const peerjsConfig = await fetch('/peerjs/config').then((r) => r.json());
  const peer = new Peer(peerjsConfig);
  let calls = [];
  const url = window.location.pathname;
  const lastSlash = url.lastIndexOf('/');
  const managerId = url.substr(lastSlash + 1);
  const messageContainer = document.getElementById('message-container');
  const sendContainer = document.getElementById('send-container');
  const messageInput = document.getElementById('message-input');

  peer.on('open', () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia
      || navigator.getUserMedia
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia
      || navigator.msGetUserMedia;

    getUserMedia({ audio: true })
      .then(startLecture)
      .catch((error) => {
        // handle error properly here.
        console.log(`Media error: ${error}`);
      });
  });

  function startLecture(stream) {
    const whiteboard = new Whiteboard('canvas');

    function handleWindowResize() {
      let timeout;
      let isStartingToResize = true;
      const inMemCanvas = document.createElement('canvas');
      const inMemCtx = inMemCanvas.getContext('2d');
      const onResizeDone = () => {
        whiteboard.canvas.height = window.innerHeight;
        whiteboard.canvas.width = window.innerWidth;
        whiteboard.paintWhite();
        whiteboard.setCurrentBoard(inMemCanvas);
        isStartingToResize = true;
      };
      $(window).on('resize', () => {
        if (isStartingToResize) {
          inMemCanvas.width = whiteboard.canvas.width;
          inMemCanvas.height = whiteboard.canvas.height;
          inMemCtx.drawImage(whiteboard.canvas, 0, 0);
          isStartingToResize = false;
        }
        clearTimeout(timeout);
        timeout = setTimeout(onResizeDone, 100);
      });
    }

    handleWindowResize();

    stream.addTrack(whiteboard.getStream().getTracks()[0]);
    const socket = io('/', { query: `id=${managerId}` });
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

    socket.on('send-to-manager', (message) => {
      appendMessage(message);
    });

    socket.on('ready', (room) => {
      whiteboard.initialize();
      const { boards, boardActive } = room.lecture_details;
      if (boards.length > 0) {
        boards.forEach((boardImg, i) => {
          createNonActiveBoardElem(boardImg, i === boardActive);
        });
      } else {
        createNonActiveBoardElem(whiteboard.getImage(), true);
      }

      let sharableUrl = window.location.href;
      sharableUrl = sharableUrl.substr(0, sharableUrl.lastIndexOf('/') + 1);
      sharableUrl += room.lecture_details.id;
      document.getElementById('copy-share-link').addEventListener('click', () => {
        const tmpInput = document.createElement('input');
        tmpInput.value = sharableUrl;
        document.body.appendChild(tmpInput);
        tmpInput.select();
        document.execCommand('copy');
        // eslint-disable-next-line func-names
        $('#copied-popup').fadeIn(200, function () {
          setTimeout(() => {
            $(this).fadeOut(300);
          }, 2000);
        });
        document.body.removeChild(tmpInput);
      });

      sendContainer.addEventListener('submit', (e) => {
        e.preventDefault();

        const message = messageInput.value;
        appendMessage(`You: ${message}`);
        socket.emit('send-to-guests', room.lecture_details.id, message);
        messageInput.value = '';
      });

      // On click for display messages button
      document.querySelector('button#toggle-messages').addEventListener('click', (e) => {
        e.preventDefault();
        // If we want to include multiple separate chat windows, this is an easy way of doing that
        const messagesChild = e.target.nextElementSibling;
        e.target.classList.toggle('active-chat');
        if (messagesChild.style.maxHeight) {
          messagesChild.style.maxHeight = null;
        } else if (messagesChild.scrollHeight >= 300) {
          messagesChild.style.maxHeight = '300px';
          messagesChild.style.overflow = 'scroll';
        } else {
          messagesChild.style.maxHeight = `${messagesChild.scrollHeight}px`;
        }
      });

      // Refresh the chat window for the new message
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


      document.querySelector('#end-lecture').addEventListener('click', () => {
        calls.forEach((call) => {
          call.close();
        });
        calls = [];
        socket.emit('lectureEnd', () => {
          window.location = `/lecture/stats/${room.lecture_details.id}`;
        });
      });

      document.querySelectorAll('[data-command]').forEach((item) => {
        item.addEventListener('click', () => {
          const command = item.getAttribute('data-command'); // not doing shit here still
          const currImage = whiteboard.getImage();
          switch (command) {
            case 'undo':
              whiteboard.undoPaint();
              break;
            case 'save':
              whiteboard.boards[whiteboard.currentBoard] = currImage;
              $('[data-page=page]').eq(`${whiteboard.currentBoard}`).find('img').attr('src', currImage);
              emitBoards();
              break;
            case 'add-page':
              whiteboard.boards[whiteboard.currentBoard] = currImage;
              $('[data-page=page]').eq(`${whiteboard.currentBoard}`).find('img').attr('src', currImage);
              $('[data-page=page]').eq(`${whiteboard.currentBoard}`).show();
              whiteboard.clearCanvas();
              createNonActiveBoardElem(whiteboard.getImage(), true);
              emitBoards();
              break;
            case 'remove-page':
              whiteboard.clearCanvas();
              if (whiteboard.boards.length > 1) {
                whiteboard.boards.splice(whiteboard.currentBoard, 1);
                $('[data-page=page]').eq(`${whiteboard.currentBoard}`).remove();
                whiteboard.currentBoard = whiteboard.boards.length - 1;
                const newBoardImg = document.createElement('img');
                newBoardImg.setAttribute('src', whiteboard.boards[whiteboard.currentBoard]);
                whiteboard.setCurrentBoard(newBoardImg);
                $('[data-page=page]').eq(`${whiteboard.currentBoard}`).hide();
              }
              emitBoards();
              break;
            case 'clear-page':
              whiteboard.clearCanvas();
              break;
            default: break;
          }
        });
      });
      initializeToolsMenu(whiteboard);

      console.log(room);
    });


    function onClickNonActiveBoardElem() {
      const currentBoardImage = whiteboard.getImage();
      whiteboard.boards[whiteboard.currentBoard] = currentBoardImage;
      $('[data-page=page]').eq(`${whiteboard.currentBoard}`).find('img').attr('src', currentBoardImage);
      $('[data-page=page]').eq(`${whiteboard.currentBoard}`).show();

      const clickedBoardIndex = $(this).index();
      whiteboard.currentBoard = clickedBoardIndex;
      emitBoards();
      $('[data-page=page]').eq(`${clickedBoardIndex}`).hide();
      const newBoardImg = document.createElement('img');
      newBoardImg.setAttribute('src', whiteboard.boards[clickedBoardIndex]);
      whiteboard.setCurrentBoard(newBoardImg);
    }

    function createNonActiveBoardElem(img, isActive) {
      // making the new page image
      const newBoardImg = document.createElement('img');
      newBoardImg.setAttribute('src', img);
      // setting the class to item and active
      const outer = document.createElement('div');
      outer.classList.add('item');

      outer.setAttribute('data-page', 'page');

      const inner = document.createElement('div');
      inner.classList.add('swatch');
      inner.style.backgroundColor = '#ffffff';

      inner.appendChild(newBoardImg);
      outer.appendChild(inner);
      document.getElementById('pagelist').appendChild(outer);
      whiteboard.boards[whiteboard.boards.length] = img;
      outer.addEventListener('click', onClickNonActiveBoardElem.bind(outer));
      if (isActive) {
        $(outer).hide();
        whiteboard.currentBoard = whiteboard.boards.length - 1;
        // must defer function to work when opening on new tab
        setTimeout(() => {
          whiteboard.setCurrentBoard(newBoardImg);
          socket.emit('currentBoardToAll', img);
        }, 0);
      }
    }

    function emitBoards() {
      socket.emit('updateBoards', {
        boards: whiteboard.boards,
        activeBoardIndex: whiteboard.currentBoard,
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
  }
};
