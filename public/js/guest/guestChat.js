import Message from '../classes/Message.js';
import Chat from '../classes/Chat.js';
import { getRandomColor } from '../utility.js';
import initializeChat from '../chatUtils.js';

const sendContainer = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');


export default function initializeGuestChat(socket, roomId, name) {
  const chat = new Chat('message-container');
  socket.emit('send-to-room', roomId, { joined: name });
  socket.on('send-to-room', (message) => {
    chat.appendMessage(message, true);
    if (!$('div.chat').hasClass('active-menu-item')) {
      const currNumOfUnread = parseInt(document.querySelector('#num-unread-messages').innerText);
      $('#num-unread-messages').html(currNumOfUnread + 1);
    }
  });

  initializeChat(chat);

  const guestChatColor = getRandomColor();
  sendContainer.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageContent = messageInput.value.trim();
    if (messageContent !== '' || chat.preview !== null) {
      const message = new Message(messageContent, chat.preview, name, guestChatColor);
      socket.emit('send-to-room', roomId, message);
      chat.appendMessage(message, false);
      messageInput.value = '';
      fileInput.value = '';
      chat.preview = null;
    }
  });
}
