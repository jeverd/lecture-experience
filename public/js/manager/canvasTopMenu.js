/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import { showInfoMessage, redirectToStats, copyTextToClipboard } from '../utility.js';

export default function initializeCanvasTopMenu(socket, whiteboard, roomId) {
  $('.hide-options-right').click(() => {
    $('.right-bar').fadeToggle();
  });

  let sharableUrl = window.location.href;
  sharableUrl = sharableUrl.substr(0, sharableUrl.lastIndexOf('/') + 1);
  sharableUrl += roomId;
  document.getElementById('copy-share-link').addEventListener('click', () => {
    copyTextToClipboard(sharableUrl);
    showInfoMessage('Link Copied!');
  });

  socket.on('updateNumOfStudents', (num) => {
    document.getElementById('specs').innerHTML = num;
  });

  document.querySelector('#end-lecture').addEventListener('click', () => {
    socket.emit('lectureEnd', () => redirectToStats(roomId));
  });

  document.querySelector('#mic-config').addEventListener('click', () => {
    $('#welcome-lecture-modal').show();
    $('#join-content').hide();
    $('#mic-content').show();
    $('#go-back').hide();
    document.querySelector('.modal-content').classList.add('lecture');
  });

  $('.hide-bar-button').click(() => {
    $('.classroom-info').fadeToggle(500);
    $('.show-bar-button-container').delay(500).fadeToggle();
    $('.left-bar').removeClass('animate__fadeInLeft').addClass('animate__fadeOutLeft');
    $('.right-bar').removeClass('animate__fadeInRight').addClass('animate__fadeOutRight');
    $('div.messages').removeClass('animate__fadeInUp').addClass('animate__fadeOutDown');
    $('.webcam-container').removeClass('animate__fadeIn').addClass('animate__fadeOut');
    $('.canvas-toggle-bar').removeClass('animate__fadeInLeft').addClass('animate__fadeOutDown');
  });

  $('.show-bar-button').click(() => {
    $('.show-bar-button-container').fadeToggle();
    $('.classroom-info').delay().fadeToggle();
    $('.left-bar').show().removeClass('animate__fadeOutLeft').addClass('animate__fadeInLeft');
    $('.right-bar').show().removeClass('animate__fadeOutRight').addClass('animate__fadeInRight');
    $('div.messages').show().removeClass('animate__fadeOutDown').addClass('animate__fadeInUp');
    $('.webcam-container').show().removeClass('animate__fadeOut').addClass('animate__fadeIn');
    $('.canvas-toggle-bar').show().removeClass('animate__fadeOutDown').addClass('animate__fadeInLeft');
  });

  $('.close-chat').click((e) => {
    e.stopPropagation();
    $('div.messages').fadeOut();
  });
}
