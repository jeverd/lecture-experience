/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-properties */
/* eslint-disable import/extensions */
/* eslint-disable import/no-absolute-path */
/* eslint-disable-next-line import/no-unresolved */
import Point from '/classes/point.js';

export function getMouseCoordsOnCanvas(e, canvas) {
  let x; let y;
  // handle tablet/phone
  if (e.touches) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }
  const rect = canvas.getBoundingClientRect();
  x = Math.round(x - rect.left);
  y = Math.round(y - rect.top);
  return new Point(x, y);
}

// This will find the distance for the drawing of the circle in the canvas
export function findDistance(point1, point2) { // coord1 ==> start, coord2 ==> finish,
  const exp1 = Math.pow(point2.x - point1.x, 2);
  const exp2 = Math.pow(point2.y - point1.y, 2);

  const distance = Math.sqrt(exp1 + exp2);

  return distance;
}

export function getImgElemFromImgData(imgData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  ctx.putImageData(imgData, 0, 0);
  const imgElem = document.createElement('img');
  imgElem.src = canvas.toDataURL();
  return imgElem;
}

export function getImgDataFromImgElem(imgElem) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = imgElem.width;
  canvas.height = imgElem.height;
  context.drawImage(imgElem, 0, 0);
  return context.getImageData(0, 0, imgElem.width, imgElem.height);
}

export function showInfoMessage(message) {
  const popupId = '#info-popup';
  $(popupId).html(message);
  // do not change to arrow function! Or else it loses "this" context.
  $(popupId).fadeIn(200, function () {
    setTimeout(() => {
      $(this).fadeOut(300);
    }, 2000);
  });
}

export function appendFile(file, fileType, fileName, identifier) {
  const messageContainer = document.getElementById('message-container');
  const messageElement = document.createElement('tr');
  let fileElement = null;

  // Doesn't work - need some kind of file upload
  if (fileType.includes('image')) {
    fileElement = document.createElement('img');
    fileElement.src = (identifier === 'sender') ? URL.createObjectURL(file) : file;
  } else {
    fileElement = document.createElement('a');
    fileElement.href = (identifier === 'sender') ? URL.createObjectURL(file) : file;
    fileElement.download = fileName;
    fileElement.innerText = fileName;
  }

  messageElement.append(fileElement);
  messageContainer.append(messageElement);

  const messageToggle = document.getElementById('toggle-messages');
  const event = new Event('redraw');
  messageToggle.dispatchEvent(event);
}

export function appendMessage(message) {
  const messageContainer = document.getElementById('message-container');
  const messageElement = document.createElement('tr');
  const tableData = document.createElement('td');
  tableData.innerText = message;

  messageElement.append(tableData);
  messageContainer.append(messageElement);

  const messageToggle = document.getElementById('toggle-messages');
  const event = new Event('redraw');
  messageToggle.dispatchEvent(event);
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
    if ($(boardView).scrollLeft() + boardView.offsetWidth >= boardView.scrollWidth - 30) {
      $('.scroll-boards-view-right').hide();
    }
  }
}

export function updateBoardsBadge() {
  document.querySelectorAll('.board-badge').forEach((badge, i) => {
    badge.innerHTML = i + 1;
  });
}
