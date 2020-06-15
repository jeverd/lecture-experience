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

  $('.my-boards-button-container').click(() => {
    if (whiteboard.boards.length <= 1) {
      showInfoMessage('You have no other boards saved.');
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
}
