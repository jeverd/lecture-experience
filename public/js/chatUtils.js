import { displayImagePopUpOnClick, downloadFile } from '../utility.js';
import Attachment from './classes/Attachment.js';

export default function initializeChat(chat) {
  const fileInput = document.getElementById('file-input');

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (fileLoadedEvent) {
      if (file.type.includes('image')) {
        $('#image-preview').attr('src', fileLoadedEvent.target.result);
      }
      chat.setPreview(new Attachment(fileLoadedEvent.target.result, file.name, file.type));
    };
    reader.readAsDataURL(file);
    if (file.type.includes('image')) {
      $('#file-preview').hide();
      $('#preview').show();
      $('#close-preview').css('bottom', '55px');
      // show image
      let imgWidth = 0;
      $('img').load(function () {
        imgWidth = $(this).width();
        const left = (15 + imgWidth + 15);
        $('#close-preview').css('left', `${left}px`);
        chat.scrollToBottom();
      });
    } else {
      $('#file-preview').show();
      $('#name-file').html(file.name);
      $('#preview').show();
      $('#close-preview').css('bottom', '3px');
      $('#close-preview').css('left', '');
      $('#close-preview').css('right', '15px');
    }
    chat.scrollToBottom();
  });

  $(document).on('click', '.name-file', (e) => {
    downloadFile($(e.target).attr('data-file'), e.target.innerHTML);
  });

  $(document).on('click', '.download-container', (e) => {
    // e.stopPropagation();
    let containerElem = $(e.target);
    while (!containerElem.hasClass('download-container')) containerElem = containerElem.parent();
    downloadFile(containerElem.attr('data-file'), containerElem.attr('data-name'));
  });

  $(document).on('click', '.message-image', displayImagePopUpOnClick);

  let click = 0;
  window.addEventListener('click', (e) => {
    const image = document.querySelector('.modal-message-image-vertical') || document.querySelector('.modal-message-image-horizontal');
    const modal = document.getElementById('image-modal');
    const download = document.querySelector('.download-container');
    if (image !== null && $(modal).is(':visible')) {
      if (!image.contains(e.target) && !download.contains(e.target) && click > 0) {
        $(modal).hide();
        $(image).remove();
        $(download).remove();
        click = 0;
      } else {
        click += 1;
      }
    }
  });

  $('#close-preview').click(() => {
    fileInput.value = '';
    $('#file-preview').hide();
    $('#name-file').html('');
    $('#image-preview').attr('src', '');
    $('#preview').hide();
    $('#close-preview').css('right', '15px');
  });
}
