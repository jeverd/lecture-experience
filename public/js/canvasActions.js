/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable import/extensions */
import {
  emitBoards, createNonActiveBoardElem, updateBoardsBadge, handleBoardsViewButtonsDisplay,
} from './managerBoards.js';
import { showInfoMessage } from './utility.js';

export default function initializeActionsMenu(socket, whiteboard) {
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
          emitBoards(socket, whiteboard);
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
          createNonActiveBoardElem(socket, whiteboard, whiteboard.getImage(), true);
          if (whiteboard.boards.length > 1) {
            $('.canvas-toggle-bar').show();
          }
          emitBoards(socket, whiteboard);
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
          if (whiteboard.boards.length === 1) {
            $('.canvas-toggle-bar').hide();
          }
          setTimeout(() => {
            handleBoardsViewButtonsDisplay();
            updateBoardsBadge();
          }, 0);
          emitBoards(socket, whiteboard);
          break;
        case 'clear-page':
          whiteboard.clearCanvas();
          break;
        default: break;
      }
    });
  });
}
