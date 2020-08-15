import { addBoard, removeBoard } from './managerBoards.js';
import { showInfoMessage, saveBoards } from '../utility.js';

export default function initializeActionsMenu(socket, whiteboard, stream) {
  document.querySelectorAll('[data-command]').forEach((item) => {
    item.addEventListener('click', () => {
      const command = item.getAttribute('data-command'); // not doing shit here still
      switch (command) {
        case 'redo':
          whiteboard.redoPaint();
          break;
        case 'undo':
          whiteboard.undoPaint();
          break;
        case 'save':
          saveBoards(socket, whiteboard);
          showInfoMessage(`${$('#boards-saved-info').val()}: ${whiteboard.boards.length}`);
          break;
        case 'add-page':
          addBoard(socket, whiteboard, stream);
          break;
        case 'remove-page':
          removeBoard(socket, whiteboard, stream);
          break;
        case 'clear-page':
          whiteboard.clearCanvas();
          break;
        default: break;
      }
    });
  });
}
