var messageContainer = document.getElementById('message-container');
var sendButton = document.getElementById('send-button');
sendButton.addEventListener('click', function () {
  messageContainer.scrollTop = messageContainer.scrollHeight;
});
