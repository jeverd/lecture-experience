/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import { showInfoMessage, redirectToStats } from './utility.js';
import { handleBoardsViewButtonsDisplay } from './managerBoards.js';

export default function initializeCanvasTopMenu(socket, whiteboard, roomId) {
  $('.hide-options-right').click(() => {
    $('.right-bar').fadeToggle();
  });

  let sharableUrl = window.location.href;
  sharableUrl = sharableUrl.substr(0, sharableUrl.lastIndexOf('/') + 1);
  sharableUrl += roomId;
  document.getElementById('copy-share-link').addEventListener('click', () => {
    const tmpInput = document.createElement('input');
    tmpInput.value = sharableUrl;
    document.body.appendChild(tmpInput);
    tmpInput.select();
    document.execCommand('copy');
    showInfoMessage('Link Copied!');
    document.body.removeChild(tmpInput);
  });

  socket.on('updateNumOfStudents', (num) => {
    document.getElementById('specs').innerHTML = num;
  });

  document.querySelector('#end-lecture').addEventListener('click', () => {
    socket.emit('lectureEnd', () => redirectToStats(roomId));
  });

  document.querySelector('.scroll-boards-view-right').addEventListener('click', () => {
    $('.canvas-toggle-nav').animate({ scrollLeft: '+=120px' }, 150, () => {
      handleBoardsViewButtonsDisplay();
    });
  });

  $('.hide-options-left').click(() => {
    $('.left-bar').fadeToggle();
  });

  document.querySelector('#mic-config').addEventListener('click', () => {
    $('#welcome-lecture-modal').show();
    $('#join-content').hide();
    $('#mic-content').show();
    $('#go-back').hide();
    document.querySelector('.modal-content').classList.add('lecture');
  });

  $('.my-boards-button-container').click(() => {
    if (whiteboard.boards.length <= 1) {
      showInfoMessage('You have only one board.');
    } else {
      $('.canvas-toggle-bar').fadeToggle();
    }
  });

  $('.hide-bar-button').click(() => {
    $('.classroom-info-flexbox').fadeToggle(500);
    $('.show-bar-button-container').delay(500).fadeToggle();
  });

  $('.show-bar-button').click(() => {
    $('.show-bar-button-container').fadeToggle();
    $('.classroom-info-flexbox').delay().fadeToggle();
  });

  $('.close-chat').click((e) => {
    e.stopPropagation();
    $('div.messages').fadeOut();
  });

  // On click for display messages button
  $('.chat-button-container').click(() => {
    const messagesDiv = $('div.messages');
    messagesDiv.fadeToggle();
  });
}
