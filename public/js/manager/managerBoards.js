/* eslint-disable no-undef */
/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */

export function emitBoards(socket, whiteboard) {
  socket.emit('updateBoards', {
    boards: whiteboard.boards,
    activeBoardIndex: whiteboard.currentBoard,
  });
}



export function handleBoardsViewButtonsDisplay() {
  const boardView = document.querySelector('.canvas-toggle-nav');
  if (boardView.offsetWidth < boardView.scrollWidth) {
    if ($(boardView).scrollLeft() > 0) {
      $('.scroll-boards-view-left').show();
    } else {
      $('.scroll-boards-view-left').hide();
    }
    $('.scroll-boards-view-right').show();
    if ($(boardView).scrollLeft() + boardView.offsetWidth >= boardView.scrollWidth) {
      $('.scroll-boards-view-right').hide();
    }
  } else {
    $('.scroll-boards-view-left').hide();
  }
}

export function updateBoardsBadge() {
  document.querySelectorAll('.board-badge').forEach((badge, i) => {
    badge.innerHTML = i + 1;
  });
}

function deactivateCurrentBoard(whiteboard) {
  // console.log(whiteboard.getSvgImage().toDataURL("image/png"), 'SVG')
  console.log(whiteboard.getSvgImage());
  const currentBoardImage = whiteboard.getImage();
  const currentBoardPath = whiteboard.getDraws();
  whiteboard.boards[whiteboard.currentBoard] = currentBoardImage;
  whiteboard.paths[whiteboard.currentBoard] = currentBoardPath;
  const currentBoardDiv = $('[data-page=page]').eq(`${whiteboard.currentBoard}`);
  currentBoardDiv.find('img').attr('src', currentBoardImage);
  currentBoardDiv.find('img').show();
  currentBoardDiv.find('video')[0].srcObject = null;
  currentBoardDiv.find('video').hide();
}

function activateCurrentBoard(socket, whiteboard, stream, clickedBoardIndex) {
  whiteboard.currentBoard = clickedBoardIndex;
  emitBoards(socket, whiteboard);
  const clickedBoardDiv = $('[data-page=page]').eq(`${clickedBoardIndex}`);
  clickedBoardDiv.find('img').hide();
  clickedBoardDiv.find('video')[0].srcObject = stream;
  clickedBoardDiv.find('video').show();
  const newBoardImg = document.createElement('img');
  newBoardImg.setAttribute('src', whiteboard.boards[clickedBoardIndex]);
  const newBoardPath = whiteboard.paths[clickedBoardIndex];
  setTimeout(() => {
    whiteboard.setPaths(newBoardPath);
    socket.emit('currentBoardToAll', newBoardImg.getAttribute('src'));
  }, 0);
}

export function createNonActiveBoardElem(socket, whiteboard, img, isActive, stream) {
  function onClickNonActiveBoardElem() {
    deactivateCurrentBoard(whiteboard);
    const clickedBoardIndex = $(this).index();
    activateCurrentBoard(socket, whiteboard, stream, clickedBoardIndex);
  }

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
  const canvasStream = document.createElement('video');
  canvasStream.autoplay = true;
  $(canvasStream).hide();
  inner.appendChild(canvasStream);
  outer.appendChild(inner);
  const pageList = document.getElementById('pagelist');
  pageList.appendChild(outer);
  const boardBadge = document.createElement('div');
  boardBadge.classList.add('board-badge');
  inner.appendChild(boardBadge);

  whiteboard.boards[whiteboard.boards.length] = img;
  newBoardImg.addEventListener('click', onClickNonActiveBoardElem.bind(outer));
  if (isActive) {
    activateCurrentBoard(socket, whiteboard, stream, whiteboard.boards.length - 1);
  }
  // must defer this for DOM to have time to update
  setTimeout(() => {
    updateBoardsBadge();
    handleBoardsViewButtonsDisplay();
  }, 0);
}

export function addBoard(socket, whiteboard, stream) {
  deactivateCurrentBoard(whiteboard);
  whiteboard.clearCanvas();
  createNonActiveBoardElem(socket, whiteboard, whiteboard.getSvgImage(), true, stream);
  emitBoards(socket, whiteboard);
  $('.canvas-toggle-nav').animate({ scrollLeft: '+=100000px' }, 150, () => {
    handleBoardsViewButtonsDisplay();
  });
}

export function removeBoard(socket, whiteboard, stream) {
  whiteboard.clearCanvas();
  if (whiteboard.boards.length > 1) {
    whiteboard.boards.splice(whiteboard.currentBoard, 1);
    $('[data-page=page]').eq(`${whiteboard.currentBoard}`).remove();
    activateCurrentBoard(socket, whiteboard, stream, whiteboard.boards.length - 1);
  }

  setTimeout(() => {
    handleBoardsViewButtonsDisplay();
    updateBoardsBadge();
  }, 0);
}

export default function initializeBoards(socket, whiteboard, boards, boardActive, stream) {
  if (boards.length > 0) {
    boards.forEach((boardImg, i) => {
      createNonActiveBoardElem(socket, whiteboard, boardImg, i === boardActive, stream);
    });
  } else {
    createNonActiveBoardElem(socket, whiteboard, whiteboard.getImage(), true, stream);
  }

  document.querySelector('.scroll-boards-view-left').addEventListener('click', () => {
    $('.canvas-toggle-nav').animate({ scrollLeft: '-=120px' }, 150, () => {
      handleBoardsViewButtonsDisplay();
    });
  });

  document.querySelector('.scroll-boards-view-right').addEventListener('click', () => {
    $('.canvas-toggle-nav').animate({ scrollLeft: '+=120px' }, 150, () => {
      handleBoardsViewButtonsDisplay();
    });
  });
}
