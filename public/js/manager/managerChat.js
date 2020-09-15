import Message from '../classes/Message.js';
import Chat from '../classes/Chat.js';
import initializeChat from '../chatUtils.js';

export default function initializeManagerChat(socket, roomId) {
  const chat = new Chat('message-container');
  socket.emit('send-to-room', roomId, { joined: $('#host-name-chat').val() });
  const sendContainer = document.getElementById('send-container');
  const messageInput = document.getElementById('message-input');
  const fileInput = document.getElementById('file-input');
  socket.on('send-to-room', (message) => {
    chat.appendMessage(message, true);
    const messagesDiv = $('div.messages');
    if (!messagesDiv.hasClass('active-chat')) {
      chat.unreadCount += 1;
      $('.new-messages-badge').html(chat.unreadCount);
    }
  });

  initializeChat(chat);

  $('#toggle-messages').click((e) => {
    e.preventDefault();
    const messagesDiv = $('div.messages');
    messagesDiv.toggleClass('active-chat');
    if (messagesDiv.hasClass('active-chat')) {
      chat.unreadCount = 0;
      $('.new-messages-badge').html(chat.unreadCount);
    }
  });

  sendContainer.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageContent = messageInput.value.trim();
    if (messageContent !== '' || chat.preview !== null) {
      const message = new Message(messageContent, chat.preview, $('#host-name-chat').val(), 'rgba(70, 194, 255, 1)');
      socket.emit('send-to-room', roomId, message);
      chat.appendMessage(message, false);
      messageInput.value = '';
      fileInput.value = '';
      chat.preview = null;
    }
  });
}
