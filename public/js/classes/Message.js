export default function Message(content, file, sender) {
  function Attachment(fileContent, name, type) {
    this.file = fileContent;
    this.name = name;
    this.type = type;
  }

  this.sender = sender;
  this.content = content;
  this.attachment = null;
  if (typeof file !== 'undefined') {
    const fileContent = URL.createObjectURL(file);
    this.attachment = new Attachment(fileContent, file.name, file.type);
  }
}
