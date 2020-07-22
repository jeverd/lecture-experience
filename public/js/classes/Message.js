export default function Message(content, file, sender, color) {
  this.color = color;
  this.sender = sender;
  this.content = content;
  this.attachment = file;
}
