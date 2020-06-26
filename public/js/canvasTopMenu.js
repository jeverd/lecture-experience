/* eslint-disable no-undef */
// eslint-disable-next-line import/extensions
import { showInfoMessage } from './utility.js';

export default function initializeCanvasTopMenu(whiteboard) {
  $('.hide-options-right').click(() => {
    $('.right-bar').fadeToggle();
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
