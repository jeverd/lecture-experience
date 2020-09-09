import { addBoard, removeBoard, deactivateCurrentBoard, activateCurrentBoard } from './managerBoards.js';
import { showInfoMessage, downloadFile, saveCurrentBoard, dataURItoBlob } from '../utility.js';

export default function initializeActionsMenu(socket, whiteboard, stream) {
  var currPage = 1
  var numPages = 0
  var thePDF = null
  function handlePages(page) {
      addBoard(socket, whiteboard, stream, true)
      var scale = 1.5
      var viewport = page.getViewport({scale: scale})
      var canvas = document.createElement('canvas')
      var context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      var task = page.render({
        canvasContext: context,
        viewport: viewport
      });

      task.promise.then(function() {
        var img_b64 = canvas.toDataURL('image/png')
        var png = img_b64.split(',')[1]
        var theFile = new Blob([window.atob(png)],  {type: 'image/png', encoding: 'utf-8'})
        var fr = new FileReader()
        whiteboard.addImg(img_b64)
        fr.readAsDataURL(theFile)
        currPage++
        if (thePDF !== null && currPage <= numPages) {
          thePDF.getPage(currPage).then(handlePages)
        } else {
          deactivateCurrentBoard(whiteboard)
          activateCurrentBoard(socket, whiteboard, stream, whiteboard.currentBoard - numPages + 1)
        }
      });
  }

  const fileInput = document.getElementById('image-input');

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (fileLoadedEvent) {
      if (file.type.includes('image')) {
        whiteboard.addImg(fileLoadedEvent.target.result)
      } else if (file.type.includes('pdf')) {
        var typedarray = new Uint8Array(fileLoadedEvent.target.result)
        var loadingTask = pdfjsLib.getDocument(typedarray)
        loadingTask.promise.then(function (pdf) {
          if (pdf.numPages > 30) {
            showInfoMessage(`${$('#pdf-too-big-msg').val()}`)
          } else {
            thePDF = pdf
            numPages = pdf.numPages
            pdf.getPage(1).then(handlePages)
          }
        });
        currPage = 1
        numPages = 0
        thePDF = null
      } else {
        showInfoMessage(`${$('#invalid-file-type-msg').val()}`)
      }
    };
    if (file.type.includes('image')) {
      reader.readAsDataURL(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
    fileInput.value = null;
  });

  window.addEventListener('paste', (event) => {
    // use event.originalEvent.clipboard for newer chrome versions
    var items = (event.clipboardData  || event.originalEvent.clipboardData).items;
    console.log(JSON.stringify(items)); // will give you the mime types
    // find pasted image among pasted items
    var blob = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        blob = items[i].getAsFile();
      }
    }
    // load image if there is a pasted image
    if (blob !== null) {
      var reader = new FileReader();
      reader.onload = function(event) {
        whiteboard.addImg(event.target.result) // data url!
      };
      reader.readAsDataURL(blob);
    }
  });

  document.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  document.addEventListener('drop', (event) => {
    event.preventDefault();

    var file = event.dataTransfer.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      whiteboard.addImg(event.target.result)
    };
    try { reader.readAsDataURL(file) } catch{}
  })

  document.querySelectorAll('[data-command]').forEach((item) => {
    item.addEventListener('click', () => {
      const command = item.getAttribute('data-command'); // not doing shit here still
      switch (command) {
        case 'redo':
          whiteboard.redoPaint();
          break;
        case 'undo':
          whiteboard.undoPaint();
          break;
        case 'save':
          saveCurrentBoard(whiteboard);
          const zip = new JSZip();
          const boardsFolder = zip.folder('boards')
          whiteboard.boards.forEach((board, i) => {
            boardsFolder.file(`board_${i+1}.png`, dataURItoBlob(board.image))
          });
          zip.generateAsync({type:"blob"})
            .then((content) => {
                downloadFile(URL.createObjectURL(content), "boards.zip")
                showInfoMessage(`${$('#boards-saved-info').val()}: ${whiteboard.boards.length}`);
            });
          break;
        case 'add-page':
          addBoard(socket, whiteboard, stream);
          break;
        case 'add-image':
          const imageInput = document.getElementById('image-input');
          break;  
        case 'remove-page':
          removeBoard(socket, whiteboard, stream);
          break;
        case 'clear-page':
          whiteboard.clearCanvas();
          break;
        default: break;
      }
    });
  });

}
