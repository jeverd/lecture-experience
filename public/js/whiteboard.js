/* eslint-disable no-use-before-define */
/* eslint-disable no-fallthrough */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */
import Whiteboard from './classes/Whiteboard.js';
import initializeToolsMenu from './toolsMenu.js';
import initializeCanvasTopMenu from './canvasTopMenu.js';
import { showInfoMessage, handleBoardsViewButtonsDisplay, createBadgeElem } from './utility.js';

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
      // .catch((error) => {
      //   // handle error properly here.
      //   console.log(`Media error: ${error}`);
      // });
  });

  function startLecture(stream) {
    const whiteboard = new Whiteboard('whiteboard');

    function handleWindowResize() {
      let timeout;
      const onResizeDone = () => {
        whiteboard.paintWhite();
        whiteboard.setCurrentBoard(inMemCanvas);
        handleBoardsViewButtonsDisplay();
      };
      $(window).on('resize', () => {
        clearTimeout(timeout);
        timeout = setTimeout(onResizeDone, 20);
      });
    }

    handleWindowResize();
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

      if (boards.length > 1) {
        $('.canvas-toggle-bar').show();
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
        showInfoMessage('Link Copied!');
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

      document.querySelector('.scroll-boards-view-right').addEventListener('click', () => {
        $('.canvas-toggle-nav').animate({ scrollLeft: '+=120px' }, 150, () => {
          handleBoardsViewButtonsDisplay();
        });
      });

      document.querySelector('.scroll-boards-view-left').addEventListener('click', () => {
        $('.canvas-toggle-nav').animate({ scrollLeft: '-=120px' }, 150, () => {
          handleBoardsViewButtonsDisplay();
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
              $('[data-page=page]')
                .eq(`${whiteboard.currentBoard}`)
                .find('img')
                .attr('src', currImage);
              emitBoards();
              break;
            case 'add-page':
              whiteboard.boards[whiteboard.currentBoard] = currImage;
              $('[data-page=page]')
                .eq(`${whiteboard.currentBoard}`)
                .find('img')
                .attr('src', currImage);
              $('[data-page=page]').eq(`${whiteboard.currentBoard}`).show();
              whiteboard.clearCanvas();
              createNonActiveBoardElem(whiteboard.getImage(), true);
              if (whiteboard.boards.length > 1) {
                $('.canvas-toggle-bar').show();
              }
              emitBoards();
              break;
            case 'remove-page':
              whiteboard.clearCanvas();
              if (whiteboard.boards.length > 1) {
                whiteboard.boards.splice(whiteboard.currentBoard, 1);
                $('[data-page=page]').eq(`${whiteboard.currentBoard}`).remove();
                whiteboard.currentBoard = whiteboard.boards.length - 1;
                const newBoardImg = document.createElement('img');
                newBoardImg.setAttribute(
                  'src',
                  whiteboard.boards[whiteboard.currentBoard],
                );
                whiteboard.setCurrentBoard(newBoardImg);
                $('[data-page=page]').eq(`${whiteboard.currentBoard}`).hide();
              }
              if (whiteboard.boards.length <= 1) {
                $('.canvas-toggle-bar').hide();
              }
              handleBoardsViewButtonsDisplay();
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
      initializeCanvasTopMenu(whiteboard);

      console.log(room);
    });

    function onClickNonActiveBoardElem() {
      const currentBoardImage = whiteboard.getImage();
      whiteboard.boards[whiteboard.currentBoard] = currentBoardImage;
      $('[data-page=page]')
        .eq(`${whiteboard.currentBoard}`)
        .find('img')
        .attr('src', currentBoardImage);
      $('[data-page=page]').eq(`${whiteboard.currentBoard}`).show();

      const clickedBoardIndex = $(this).index();
      whiteboard.currentBoard = clickedBoardIndex;
      emitBoards();
      $('[data-page=page]').eq(`${clickedBoardIndex}`).hide();
      const newBoardImg = document.createElement('img');
      newBoardImg.setAttribute('src', whiteboard.boards[clickedBoardIndex]);
      whiteboard.setCurrentBoard(newBoardImg, whiteboard.boards[clickedBoardIndex]);
    }

    function createNonActiveBoardElem(img, isActive) {
      // making the new page image
      const newBoardImg = document.createElement('img');
      newBoardImg.setAttribute('src', img);
      // setting the class to item and active
      const outer = document.createElement('li');
      outer.classList.add('canvas-toggle-item');

      outer.setAttribute('data-page', 'page');

      const inner = document.createElement('a');
      inner.classList.add('canvas-toggle-link');
      inner.appendChild(newBoardImg);
      outer.appendChild(inner);
      const pageList = document.getElementById('pagelist');
      pageList.appendChild(outer);
      inner.appendChild(createBadgeElem($(outer).index() + 1));
      whiteboard.boards[whiteboard.boards.length] = img;
      newBoardImg.addEventListener('click', onClickNonActiveBoardElem.bind(outer));
      if (isActive) {
        $(outer).hide();
        whiteboard.currentBoard = whiteboard.boards.length - 1;
        // must defer function to work when opening on new tab
        setTimeout(() => {
          whiteboard.setCurrentBoard(newBoardImg);
          socket.emit('currentBoardToAll', img);
        }, 0);
      }

      handleBoardsViewButtonsDisplay();
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
