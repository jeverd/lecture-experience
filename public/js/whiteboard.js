/* eslint-disable no-use-before-define */
/* eslint-disable no-fallthrough */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */
import Whiteboard from './classes/whiteboard.js';
import initializeToolsMenu from './tools.js';
import initializeCanvasTopMenu from './canvasTopMenu.js';
import Message from './classes/Message.js';
import Chat from './classes/Chat.js';
import initModal from './canvasModal.js';
import {
  showInfoMessage, handleBoardsViewButtonsDisplay, updateBoardsBadge,
} from './utility.js';




window.onload = () => {
  async function beginLecture(stream) {
    const peerjsConfig = await fetch('/peerjs/config').then((r) => r.json());
    const peer = new Peer(peerjsConfig);
    let calls = [];
    const url = window.location.pathname;
    const lastSlash = url.lastIndexOf('/');
    const managerId = url.substr(lastSlash + 1);
    const sendContainer = document.getElementById('send-container');
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');

    peer.on('open', () => {
      const whiteboard = new Whiteboard('canvas');
      const chat = new Chat('message-container');
  
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
          handleBoardsViewButtonsDisplay();
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
      $(window).on('beforeunload', (e) => {
        e.preventDefault();
        socket.disconnect();
      });
      socket.on('call', (remotePeerId) => {
        const call = peer.call(remotePeerId, stream);
        calls.push(call);
      });
  
      socket.on('send-to-manager', (message) => {
        chat.appendMessage(message, true);
        const messagesDiv = $('div.messages');
        if (!messagesDiv.hasClass('active-chat')) {
          chat.unreadCount += 1;
          $('.new-messages-badge').html(chat.unreadCount);
        }
      });
  
      $('#toggle-messages').click((e) => {
        e.preventDefault();
        const messagesDiv = $('div.messages');
        messagesDiv.toggleClass('active-chat');
        if (messagesDiv.hasClass('active-chat')) {
          chat.unreadCount = 0;
          $('.new-messages-badge').html(chat.unreadCount);
        }
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
          const messageContent = messageInput.value;
          const newFile = document.getElementById('file-input').files[0];
          const message = new Message(messageContent, newFile);
          socket.emit('send-to-guests', room.lecture_details.id, message);
          chat.appendMessage(message, false);
          messageInput.value = '';
          fileInput.value = '';
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
  
        document.querySelectorAll('[data-command]').forEach((item) => {
          item.addEventListener('click', () => {
            const command = item.getAttribute('data-command'); // not doing shit here still
            const currImage = whiteboard.getImage();
            switch (command) {
              case 'redo':
                whiteboard.redoPaint();
                break;
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
                showInfoMessage(`Saved - Boards Count: ${whiteboard.boards.length}`);
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
                setTimeout(() => {
                  handleBoardsViewButtonsDisplay();
                  updateBoardsBadge();
                }, 0);
                emitBoards();
                break;
              case 'clear-page':
                whiteboard.clearCanvas();
                break;
              default: break;
            }
          });
        });
  
        document.querySelector('.scroll-boards-view-left').addEventListener('click', () => {
          $('.canvas-toggle-nav').animate({ scrollLeft: '-=120px' }, 150, () => {
            handleBoardsViewButtonsDisplay();
          });
        });
  
        $('[lecture-name]').html(room.lecture_details.name);
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
        whiteboard.setCurrentBoard(newBoardImg);
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
        const boardBadge = document.createElement('div');
        boardBadge.classList.add('board-badge');
        inner.appendChild(boardBadge);
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
        // must defer this for DOM to have time to update
        setTimeout(() => {
          updateBoardsBadge();
          handleBoardsViewButtonsDisplay();
        }, 0);
      }
  
      function emitBoards() {
        socket.emit('updateBoards', {
          boards: whiteboard.boards,
          activeBoardIndex: whiteboard.currentBoard,
        });
      }
      

    });  
  }

  $('#welcome-lecture-modal').show();

  const getUserMedia = navigator.mediaDevices.getUserMedia
                      || navigator.getUserMedia
                      || navigator.webkitGetUserMedia
                      || navigator.mozGetUserMedia
                      || navigator.msGetUserMedia;

  getUserMedia({ audio: true }).then((stream)=>{
    initModal(stream);
    $('#modal-select-button').click(() => {
      // call endpoint to validade session
      fetch('/session').then((req) => {
        if (req.status === 200) {
          beginLecture(stream);
        }
        if (req.status === 401) {
          window.location.replace('/');
        }
        });
  
      // if valid run the functions below
      $('#welcome-lecture-modal').hide();
    }); 

  })
    .catch((error) => {
      // handle error properly here.
      consolFe.log(`Media error: ${error}`);
    });

};


