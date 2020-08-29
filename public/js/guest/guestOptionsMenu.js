import { showInfoMessage, toggleSpeakers } from '../utility.js';

function handleOptionClick() {
  const targetId = this.getAttribute('target-id');
  const targetElem = $(`#${targetId}`);
  if (targetId === 'boards-view' && $('#num-boards').html() === '0') {
    showInfoMessage($('#no-other-boards-text').val());
    return;
  }
  const activeOptionClass = 'active-menu-item';
  const activeOptionButtonClass = 'active-menu-item-button';
  if (targetElem.hasClass(activeOptionClass)) {
    targetElem.hide();
    targetElem.removeClass(activeOptionClass);
    $(this).removeClass(activeOptionButtonClass);
  } else {
    if (targetId === 'chat-view') {
      $('#num-unread-messages').html(0);
      $('.message-lecture-name').css('opacity', 0);
      $('.message-content').css('opacity', 0);
      $('.minimize-chat-view').css('opacity', 0);
    } else if (targetId === 'boards-view') {
      $('.non-active-boards-title').css('opacity', 0);
    }
    $(`.${activeOptionClass}`).hide();
    $(`.${activeOptionClass}`).removeClass(activeOptionClass);
    $(`.${activeOptionButtonClass}`).removeClass(activeOptionButtonClass);
    targetElem.show();
    setTimeout(() => {
      targetElem.addClass(activeOptionClass);
      $(this).addClass(activeOptionButtonClass);
      setTimeout(() => {
        $('.message-lecture-name').css('opacity', 0.4);
        $('.message-content').css('opacity', 1);
        $('.non-active-boards-title').css('opacity', 1);
        $('.minimize-chat-view').css('opacity', 1);
      }, 700);
    }, 0);
  }
}

export default function initializeOptionsMenu() {
  $('#toggle-boards-view').click(handleOptionClick);
  $('#toggle-chat-view').click(handleOptionClick);
  $('#close-non-active-boards').click(() => $('#toggle-boards-view').click());
  $('#minimize-chat-view').click(() => $('#toggle-chat-view').click());

  $('#toggle-speaker').click(function () {
    $(this).toggleClass('fa-volume-up');
    $(this).toggleClass('fa-volume-mute');
    toggleSpeakers();
  });

  $('#fullscreen-video').click(() => {
    const elem = document.getElementById('whiteboard');
    if (screenfull.isEnabled) {
      screenfull.request(elem);
    }
  });

  // check this later to use it on the other modals.
  $('#connect-on-your-phone').click(() => $('#qr-code-modal').fadeIn());
  $('.qrcode-modal-content').click((e) => e.stopPropagation());
  $('#qr-code-modal').click(function (e) { e.stopPropagation(); $(this).fadeOut(); });

  $('#toggle-chat-view').click();
}
