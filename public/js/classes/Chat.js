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
    const tableData = document.createElement('div');
    tableData.innerText = message.content;
    if (message.attachment !== null) {
      
      messageElement.append();
    }
    messageElement.append(tableData);
    this.container.append(messageElement);
    const messageToggle = document.getElementById('toggle-messages');
    this.container.scrollTop = this.container.scrollHeight;
    const event = new Event('redraw');
    messageToggle.dispatchEvent(event);
  }
}
