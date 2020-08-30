import { showInfoMessage, redirectToStats, copyTextToClipboard } from '../utility.js';
import { showConfigModal } from './streamConfigurations.js';

export default function initializeCanvasTopMenu(socket, roomId) {
  const hasAudio = $('#audioValidator').val() === 'true';
  const hasWebcam = $('#webcamValidator').val() === 'true';
  const hasWhiteboard = $('#whiteboardValidator').val() === 'true';
  $('.hide-options-right').click(() => {
    $('.right-bar').fadeToggle();
  });

  let sharableUrl = window.location.href;
  sharableUrl = sharableUrl.substr(0, sharableUrl.lastIndexOf('/') + 1);
  sharableUrl += roomId;
  document.getElementById('copy-share-link').addEventListener('click', () => {
    copyTextToClipboard(sharableUrl);
    showInfoMessage(`${$('#link-copied-info').val()}!`);
  });

  if (hasAudio || hasWebcam) {
    document.querySelector('#mic-config').addEventListener('click', () => {
      $('#welcome-lecture-modal').show();
      $('#join-content').hide();
      $('#go-back').hide();
      showConfigModal();
      document.querySelector('.modal-content').classList.add('lecture');
    });
  } else {
    $('#mic-config').hide();
    $('#config-divider').hide();
  }

  socket.on('updateNumOfStudents', (roomSizeObj) => {
    if (`${roomSizeObj.room}` === `${roomId}`) {
      document.getElementById('specs').innerHTML = roomSizeObj.size;
    }
  });

  document.querySelector('#end-lecture').addEventListener('click', () => {
    socket.emit('lectureEnd', () => redirectToStats(roomId));
  });

  $('.hide-bar-button').click(() => {
    $('.classroom-info').fadeToggle(500);
    $('.show-bar-button-container').delay(500).fadeToggle();
    $('.left-bar').removeClass('animate__fadeInLeft').addClass('animate__fadeOutLeft');
    $('.right-bar').removeClass('animate__fadeInRight').addClass('animate__fadeOutRight');
    $('div.messages').removeClass('animate__fadeInUp').addClass('animate__fadeOutDown');
    $('.webcam-container').removeClass('animate__fadeIn').addClass('animate__fadeOut');
    $('.toggle-canvas-and-audio-menu-wrap').removeClass('animate__fadeInLeft').addClass('animate__fadeOutDown');
  });

  $('.show-bar-button').click(() => {
    $('.show-bar-button-container').fadeToggle(1200);
    $('.classroom-info').delay().fadeToggle();
    $('.left-bar').show().removeClass('animate__fadeOutLeft').addClass('animate__fadeInLeft');
    $('.right-bar').show().removeClass('animate__fadeOutRight').addClass('animate__fadeInRight');
    $('div.messages').show().removeClass('animate__fadeOutDown').addClass('animate__fadeInUp');
    $('.webcam-container').show().removeClass('animate__fadeOut').addClass('animate__fadeIn');
    $('.toggle-canvas-and-audio-menu-wrap').show().removeClass('animate__fadeOutDown').addClass('animate__fadeInLeft');
  });

  setTimeout(() => $('.show-bar-button').click(), 400);
}
