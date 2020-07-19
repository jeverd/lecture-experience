import { showInfoMessage } from '../utility.js';


function handleOptionClick() {
  const targetId = this.getAttribute('target-id');
  const targetElem = $(`#${targetId}`);
  if (targetId === 'boards-view' && $('#num-boards').html() === '0') {
    showInfoMessage('No other boards to display');
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
    const volumeIcon = $(this).find('i');
    volumeIcon.toggleClass('fa-volume-up');
    volumeIcon.toggleClass('fa-volume-off');
    $(this).parent().find('audio')[0].muted = volumeIcon.hasClass('fa-volume-off');
  });

  $('#toggle-chat-view').click();
}
