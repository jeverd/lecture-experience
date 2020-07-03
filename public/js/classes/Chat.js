export default class Chat {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.unreadCount = 0;
    this.history = [];
  }

  /**
   * Appends message to chat container
   * @param Message
   * @returns void
   * */
  appendMessage(message, isIncoming) {
    const time = new Date();
    this.history.push({ message, isIncoming, time });
    const messageElement = document.createElement('div');
    messageElement.classList.add(isIncoming ? 'incoming-message' : 'outgoing-message');
    messageElement.classList.add('message-margin');
    const tableData = document.createElement('div');
    tableData.classList.add('message-content');
    tableData.classList.add(isIncoming ? 'in' : 'out');
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.innerText = message.content;
    let image; let file; let name; let fileImage;
    if (message.attachment !== null) {
      file = document.createElement('div');
      if (messageText.innerHTML !== '') {
        file.classList.add('bottom-padding');
      }

      if (message.attachment.type.includes('image')) {
        image = document.createElement('img');
        image.classList.add('message-image');
        image.src = message.attachment.file;
        image.setAttribute('data-name', message.attachment.name);
        file.append(image);
        tableData.append(file);
      } else {
        fileImage = document.createElement('span');
        fileImage.innerHTML = '<i class="fas fa-file" aria-hidden="true"></i>';
        fileImage.classList.add('file-preview');
        name = document.createElement('span');
        name.classList.add('name-file');
        name.innerHTML = message.attachment.name;
        name.setAttribute('data-file', message.attachment.file);
        name.setAttribute('href', message.attachment.file);

        file.append(fileImage);
        file.append(name);
        tableData.append(file);
      }

      document.getElementById('file-input').value = '';
      $('#file-preview').hide();
      $('#name-file').html('');
      $('#image-preview').attr('src', '');
      $('#preview').hide();
      $('#close-preview').css('right', '15px');
    }
    tableData.append(messageText);
    messageElement.append(tableData);
    this.container.append(messageElement);
    const messageToggle = document.getElementById('toggle-messages');
    this.container.scrollTop = this.container.scrollHeight;
    const event = new Event('redraw');
    messageToggle.dispatchEvent(event);
  }
}
