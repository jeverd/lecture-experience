function handleOptionClick() {
  const targetId = this.getAttribute('target-id');
  const targetElem = $(`#${targetId}`);
  const activeOptionClass = 'active-menu-item';
  const activeOptionButtonClass = 'active-menu-item-button';
  const optionsMenu = $('.options-menu');
  const noOptionsBoardersClass = 'menu-borders';
  if (targetElem.hasClass(activeOptionClass)) {
    targetElem.hide();
    optionsMenu.addClass(noOptionsBoardersClass);
    targetElem.removeClass(activeOptionClass);
    $(this).removeClass(activeOptionButtonClass);
  } else {
    optionsMenu.removeClass(noOptionsBoardersClass);
    $(`.${activeOptionClass}`).hide();
    $(`.${activeOptionClass}`).removeClass(activeOptionClass);
    $(`.${activeOptionButtonClass}`).removeClass(activeOptionButtonClass);
    if (targetId === 'chat-view') {
      $('.message-content').css('opacity', 0);
    }
    targetElem.show();
    setTimeout(() => {
      targetElem.addClass(activeOptionClass);
      $(this).addClass(activeOptionButtonClass);
      setTimeout(() => {
        $('.message-content').css('opacity', 1);
      }, 300);
    }, 0);
  }
}

export default function initializeOptionsMenu() {
  $('#toggle-boards-view').click(handleOptionClick);
  $('#toggle-chat-view').click(handleOptionClick);
}
