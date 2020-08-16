import { addBoard, removeBoard } from './managerBoards.js';
import { showInfoMessage, downloadFile, saveCurrentBoard, dataURItoBlob } from '../utility.js';

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
          saveCurrentBoard(whiteboard);
          const zip = new JSZip();
          const boardsFolder = zip.folder('boards')
          whiteboard.boards.forEach((board, i) => {
            boardsFolder.file(`board_${i+1}.png`, dataURItoBlob(board.image))
          });
          zip.generateAsync({type:"blob"})
            .then((content) => {
                downloadFile(URL.createObjectURL(content), "boards.zip")
                showInfoMessage(`${$('#boards-saved-info').val()}: ${whiteboard.boards.length}`);
            });
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
