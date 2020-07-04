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
    if ($(boardView).scrollLeft() + boardView.offsetWidth >= boardView.scrollWidth - 15) {
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

export function createNonActiveBoardElem(socket, whiteboard, img, isActive) {
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
    emitBoards(socket, whiteboard);
    $('[data-page=page]').eq(`${clickedBoardIndex}`).hide();
    const newBoardImg = document.createElement('img');
    newBoardImg.setAttribute('src', whiteboard.boards[clickedBoardIndex]);
    whiteboard.setCurrentBoard(newBoardImg);
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

export default function initializeBoards(socket, whiteboard, boards, boardActive) {
  if (boards.length > 0) {
    boards.forEach((boardImg, i) => {
      createNonActiveBoardElem(socket, whiteboard, boardImg, i === boardActive);
    });
  } else {
    createNonActiveBoardElem(socket, whiteboard, whiteboard.getImage(), true);
  }

  if (boards.length > 1) {
    $('.canvas-toggle-bar').show();
  }

  document.querySelector('.scroll-boards-view-left').addEventListener('click', () => {
    $('.canvas-toggle-nav').animate({ scrollLeft: '-=120px' }, 150, () => {
      handleBoardsViewButtonsDisplay();
    });
  });
}
