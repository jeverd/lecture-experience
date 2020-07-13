/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import Message from '../classes/Message.js';
import Chat from '../classes/Chat.js';

const sendContainer = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const chatColors = ['red', 'green', 'blue', 'orange', 'grey'];


export default function initializeChat(socket, roomId, name) {
  const chat = new Chat('message-container');
  socket.on('send-to-room', (message) => {
    chat.appendMessage(message, true);
    // if (file) appendFile(file, fileType, fileName, 'receiver');
  });
  function downloadFile(file, fileName) {
    const messageContainer = document.getElementById('message-container');
    const messageElement = document.createElement('tr');
    messageElement.style.display = 'none';
    let fileElement = null;
    fileElement = document.createElement('a');
    fileElement.href = file;
    fileElement.download = fileName;
    fileElement.innerText = fileName;
    messageElement.append(fileElement);
    messageContainer.append(messageElement);
    const messageToggle = document.getElementById('toggle-messages');
    const event = new Event('redraw');
    messageToggle.dispatchEvent(event);
    fileElement.click();
    $(messageElement).remove();
  }

  function readURL(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = function (e) {
        $('#image-preview').attr('src', e.target.result);
      };

      reader.readAsDataURL(input.files[0]);
    }
  }

  fileInput.addEventListener('change', (e) => {
    document.querySelector('#message-container').appendChild(document.querySelector('#preview'));
    const file = e.target.files[0];
    if (file.type.includes('image')) {
      readURL(fileInput);
      $('#file-preview').hide();
      $('#preview').show();
      $('#close-preview').css('bottom', '55px');
      // show image
      let imgWidth = 0;
      $('img').load(function () {
        imgWidth = ($(this).width());
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
  });

  $(document).on('click', '.name-file', (e) => {
    downloadFile($(e.target).attr('data-file'), e.target.innerHTML);
  });

  $(document).on('click', '.download-container', (e) => {
    let containerElem = $(e.target);
    while (!containerElem.hasClass('download-container')) containerElem = containerElem.parent();
    downloadFile(containerElem.attr('data-file'), containerElem.attr('data-name'));
  });

  $(document).on('click', '.message-image', (e) => {
    const image = e.target;
    const newImage = document.createElement('img');
    newImage.classList.add('modal-message-image');
    newImage.src = image.src;

    const downloadContainer = document.createElement('div');
    const text = document.createElement('span');
    const button = document.createElement('span');

    text.innerHTML = $(image).attr('data-name');
    button.innerHTML = "<i class='fas fa-cloud-download-alt'></i>";
    downloadContainer.setAttribute('data-file', image.src);
    downloadContainer.setAttribute('data-name', $(image).attr('data-name'));

    downloadContainer.append(text);
    downloadContainer.append(button);

    document.getElementById('image-modal').append(newImage);
    document.getElementById('image-modal').append(downloadContainer);
    downloadContainer.classList.add('download-container');
    const container = document.querySelector('.wrap-div-message-image');
    container.innerHTML = '';
    container.appendChild(newImage);
    container.appendChild(downloadContainer);

    $('#image-modal').show();
  });

  let click = 0;
  window.addEventListener('click', (e) => {
    const image = document.querySelector('.modal-message-image');
    const modal = document.getElementById('image-modal');
    const download = document.querySelector('.download-container');
    if (modal.style.display === 'block') {
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

  function randomColor() {
    return chatColors[Math.floor(Math.random() * chatColors.length)];
  }

  const chatColor = randomColor();
  sendContainer.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageContent = messageInput.value.trim();
    const newFile = document.getElementById('file-input').files[0];
    if (!(messageContent === '' && typeof newFile === 'undefined')) {
      const message = new Message(messageContent, newFile, name, chatColor);
      socket.emit('send-to-room', roomId, message);
      chat.appendMessage(message, false);
      messageInput.value = '';
      fileInput.value = '';
    }
  });
}
