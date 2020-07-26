
import { displayImagePopUpOnClick } from '../utility.js';

export default function setNonActiveBoards(boards) {
  if ($('#boards-view').hasClass('active-menu-item') && boards.length === 0) {
    $('#toggle-boards-view').click();
  }
  const boardsDiv = document.getElementById('non-active-boards');
  boardsDiv.innerHTML = '';
  boards.forEach((board, i) => {
    const outer = document.createElement('div');
    outer.classList.add('non-active-board-wrapper');
    const imgElem = document.createElement('img');
    imgElem.src = board;
    $(imgElem).attr('data-name', `board${i}.png`);
    imgElem.onclick = displayImagePopUpOnClick;
    outer.appendChild(imgElem);
    boardsDiv.appendChild(outer);
  });
  document.querySelector('#num-boards').innerHTML = boards.length;
}
