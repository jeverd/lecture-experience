export function emitBoards(socket, whiteboard) {
  socket.emit('updateBoards', {
    boards: whiteboard.boards,
    activeBoardIndex: whiteboard.currentBoard,
  });
  socket.emit('currentBoardToAll', whiteboard.boards[whiteboard.currentBoard].image);
}

export function handleBoardsViewButtonsDisplay() {
  const boardView = document.querySelector('.canvas-toggle-nav');
  if (boardView.querySelectorAll('li').length >= 3 && boardView.offsetWidth === 0 && boardView.scrollWidth === 0) {
    $('.scroll-boards-view-right').show();
  } else if (boardView.offsetWidth < boardView.scrollWidth) {
    if ($(boardView).scrollLeft() > 0) {
      $('.scroll-boards-view-left').show();
    } else {
      $('.scroll-boards-view-left').hide();
    }
    $('.scroll-boards-view-right').show();
    if ($(boardView).scrollLeft() + boardView.offsetWidth >= boardView.scrollWidth - 20) {
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

export function deactivateCurrentBoard(whiteboard, zoom = null) {
  // console.log(whiteboard.getSvgImage());
  whiteboard.boards[whiteboard.currentBoard] = whiteboard.makeNewBoard(zoom);
  const currentBoardDiv = $('[data-page=page]').eq(`${whiteboard.currentBoard}`);
  currentBoardDiv.find('img').attr('src', whiteboard.boards[whiteboard.currentBoard].image);
  currentBoardDiv.find('img').show();
  currentBoardDiv.find('video')[0].srcObject = null;
  currentBoardDiv.find('video').hide();
}

export function activateCurrentBoard(socket, whiteboard, stream, clickedBoardIndex) {
  whiteboard.currentBoard = clickedBoardIndex;
  emitBoards(socket, whiteboard);
  const clickedBoardDiv = $('[data-page=page]').eq(`${clickedBoardIndex}`);
  clickedBoardDiv.find('img').hide();
  clickedBoardDiv.find('video')[0].srcObject = stream;
  clickedBoardDiv.find('video').show();
  const newBoardImg = document.createElement('img');
  newBoardImg.setAttribute('src', whiteboard.boards[clickedBoardIndex].image);
  const newBoardPath = whiteboard.boards[clickedBoardIndex].pathsData;
  setTimeout(() => {
    if (whiteboard.boards[whiteboard.currentBoard].zoom) {
      whiteboard.setZoom(whiteboard.boards[whiteboard.currentBoard].zoom)
    }
    whiteboard.setPaths(newBoardPath);
    socket.emit('currentBoardToAll', newBoardImg.getAttribute('src'));
  }, 0);
}

export function createNonActiveBoardElem(socket, whiteboard, board, isActive, stream) {
  function onClickNonActiveBoardElem() {
    const zoom = whiteboard.getZoom();
    whiteboard.boards[whiteboard.currentBoard].zoom = zoom;
    deactivateCurrentBoard(whiteboard, zoom);
    const clickedBoardIndex = $(this).index();
    activateCurrentBoard(socket, whiteboard, stream, clickedBoardIndex);
  }

  // making the new page image
  const newBoardImg = document.createElement('img');

  newBoardImg.setAttribute('src', board.image);
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

  whiteboard.boards[whiteboard.boards.length] = board;
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
  createNonActiveBoardElem(socket, whiteboard, whiteboard.makeNewBoard(), true, stream);
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
    boards.forEach((board, i) => {
      createNonActiveBoardElem(socket, whiteboard, board, i === boardActive, stream);
    });
  } else {
    createNonActiveBoardElem(socket, whiteboard, whiteboard.makeNewBoard(), true, stream);
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
