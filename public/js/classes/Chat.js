export default class Chat {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.unreadCount = 0;
    this.history = [];
    this.preview = null;
  }

  appendMessage(message, isIncoming) {
    const time = new Date();
    this.history.push({
      message, isIncoming, time,
    });
    const messageElement = document.createElement('div');
    const isLeavingRoomMsg = typeof message.left !== 'undefined';
    const isJoiningRoomMsg = typeof message.joined !== 'undefined';
    if (isLeavingRoomMsg || isJoiningRoomMsg) {
      messageElement.classList.add('message-lecture-name');
      const from = isJoiningRoomMsg ? message.joined : message.left;
      const action = $(`#${isJoiningRoomMsg ? 'joined-chat-action' : 'left-chat-action'}`).val();
      messageElement.innerHTML = `${from} ${action}`;
    } else {
      messageElement.classList.add(isIncoming ? 'incoming-message' : 'outgoing-message');
      messageElement.classList.add('message-margin');
      const tableData = document.createElement('div');
      tableData.classList.add('message-content');
      tableData.classList.add(isIncoming ? 'in' : 'out');
      const nameDiv = document.createElement('div');
      nameDiv.classList.add('bottom-padding');
      const nameSpan = document.createElement('span');
      nameSpan.classList.add('name-span');
      if (tableData.classList.contains('out')) {
        nameSpan.innerHTML = $('#you-name-chat').val();
        nameDiv.append(nameSpan);
        tableData.append(nameDiv);
      }
      if (tableData.classList.contains('in')) {
        tableData.style.background = message.color;
        nameSpan.innerHTML = message.sender;
        nameDiv.append(nameSpan);
        tableData.append(nameDiv);
      }
      const messageText = document.createElement('div');
      messageText.classList.add('message-text');
      messageText.innerText = message.content;
      let image; let file; let imageName; let fileImage;
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
          imageName = document.createElement('span');
          imageName.classList.add('name-file');
          imageName.innerHTML = message.attachment.name;
          imageName.setAttribute('data-file', message.attachment.file);
          imageName.setAttribute('href', message.attachment.file);
  
          file.append(fileImage);
          file.append(imageName);
          tableData.append(file);
        }
        if (!isIncoming) {
          $('#file-preview').hide();
          $('#name-file').html('');
          $('#image-preview').attr('src', '');
          $('#close-preview').css('right', '15px');
          $('#preview').hide();
        }
      }
      tableData.append(messageText);
      messageElement.append(tableData);
    }
    this.container.append(messageElement);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  setPreview(src) {
    this.preview = src;
  }
}
