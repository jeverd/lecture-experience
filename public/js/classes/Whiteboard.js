import { showInfoMessage } from '../utility.js';
import { handleBoardsViewButtonsDisplay } from '../manager/managerBoards.js';
import Tools from './Tools.js';
import Board from './Board.js';

export default class Whiteboard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.context = this.canvas.getContext('2d');
    this.canvas.style.cursor = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTVwdCIgaGVpZ2h0PSIxNXB0IiB2aWV3Qm94PSIwIDAgMTUgMTUiIHZlcnNpb249IjEuMSI+CjxnIGlkPSJzdXJmYWNlMSI+CjxwYXRoIHN0eWxlPSIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDpyZ2IoMCUsMCUsMCUpO2ZpbGwtb3BhY2l0eToxOyIgZD0iTSAxNC41ODU5MzggNC4xNjQwNjIgTCAxMy4yMzQzNzUgNS41MTU2MjUgQyAxMy4wOTc2NTYgNS42NTIzNDQgMTIuODc1IDUuNjUyMzQ0IDEyLjczODI4MSA1LjUxNTYyNSBMIDkuNDg0Mzc1IDIuMjYxNzE5IEMgOS4zNDc2NTYgMi4xMjUgOS4zNDc2NTYgMS45MDIzNDQgOS40ODQzNzUgMS43NjE3MTkgTCAxMC44MzU5MzggMC40MTQwNjIgQyAxMS4zODI4MTIgLTAuMTM2NzE5IDEyLjI3MzQzOCAtMC4xMzY3MTkgMTIuODI0MjE5IDAuNDE0MDYyIEwgMTQuNTg1OTM4IDIuMTcxODc1IEMgMTUuMTM2NzE5IDIuNzIyNjU2IDE1LjEzNjcxOSAzLjYxMzI4MSAxNC41ODU5MzggNC4xNjQwNjIgWiBNIDguMzI4MTI1IDIuOTIxODc1IEwgMC42MzI4MTIgMTAuNjE3MTg4IEwgMC4wMTE3MTg4IDE0LjE3NTc4MSBDIC0wLjA3NDIxODggMTQuNjU2MjUgMC4zNDM3NSAxNS4wNzQyMTkgMC44MjgxMjUgMTQuOTkyMTg4IEwgNC4zODY3MTkgMTQuMzY3MTg4IEwgMTIuMDc4MTI1IDYuNjcxODc1IEMgMTIuMjE4NzUgNi41MzUxNTYgMTIuMjE4NzUgNi4zMTI1IDEyLjA3ODEyNSA2LjE3NTc4MSBMIDguODI4MTI1IDIuOTIxODc1IEMgOC42ODc1IDIuNzg1MTU2IDguNDY0ODQ0IDIuNzg1MTU2IDguMzI4MTI1IDIuOTIxODc1IFogTSAzLjYzNjcxOSA5Ljk1NzAzMSBDIDMuNDc2NTYyIDkuNzk2ODc1IDMuNDc2NTYyIDkuNTM5MDYyIDMuNjM2NzE5IDkuMzc4OTA2IEwgOC4xNDg0MzggNC44NjcxODggQyA4LjMwODU5NCA0LjcwMzEyNSA4LjU2NjQwNiA0LjcwMzEyNSA4LjcyNjU2MiA0Ljg2NzE4OCBDIDguODkwNjI1IDUuMDI3MzQ0IDguODkwNjI1IDUuMjg1MTU2IDguNzI2NTYyIDUuNDQ1MzEyIEwgNC4yMTQ4NDQgOS45NTcwMzEgQyA0LjA1NDY4OCAxMC4xMTcxODggMy43OTY4NzUgMTAuMTE3MTg4IDMuNjM2NzE5IDkuOTU3MDMxIFogTSAyLjU3ODEyNSAxMi40MjE4NzUgTCAzLjk4NDM3NSAxMi40MjE4NzUgTCAzLjk4NDM3NSAxMy40ODQzNzUgTCAyLjA5Mzc1IDEzLjgxNjQwNiBMIDEuMTgzNTk0IDEyLjkwNjI1IEwgMS41MTU2MjUgMTEuMDE1NjI1IEwgMi41NzgxMjUgMTEuMDE1NjI1IFogTSAyLjU3ODEyNSAxMi40MjE4NzUgIi8+CjwvZz4KPC9zdmc+Cg=='), auto";
    this.currentBoard = 0;
    this.paintWhite();
    this.boards = [];
    this.centerCoords = [];
    this.undoStack = [];
    this.redoStack = [];
  }

  set activeTool(tool) {
    this.tool = tool;
  }

  set lineWidth(lineWidth) {
    this._lineWidth = lineWidth;
    this.context.lineWidth = this._lineWidth;
  }

  set selectedColor(color) {
    this._color = color;
    this.context.strokeStyle = this._color;
  }

  updateCursor(tool) {
    const tools = {
      "pencil": 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTVwdCIgaGVpZ2h0PSIxNXB0IiB2aWV3Qm94PSIwIDAgMTUgMTUiIHZlcnNpb249IjEuMSI+CjxnIGlkPSJzdXJmYWNlMSI+CjxwYXRoIHN0eWxlPSIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDpyZ2IoMCUsMCUsMCUpO2ZpbGwtb3BhY2l0eToxOyIgZD0iTSAxNC41ODU5MzggNC4xNjQwNjIgTCAxMy4yMzQzNzUgNS41MTU2MjUgQyAxMy4wOTc2NTYgNS42NTIzNDQgMTIuODc1IDUuNjUyMzQ0IDEyLjczODI4MSA1LjUxNTYyNSBMIDkuNDg0Mzc1IDIuMjYxNzE5IEMgOS4zNDc2NTYgMi4xMjUgOS4zNDc2NTYgMS45MDIzNDQgOS40ODQzNzUgMS43NjE3MTkgTCAxMC44MzU5MzggMC40MTQwNjIgQyAxMS4zODI4MTIgLTAuMTM2NzE5IDEyLjI3MzQzOCAtMC4xMzY3MTkgMTIuODI0MjE5IDAuNDE0MDYyIEwgMTQuNTg1OTM4IDIuMTcxODc1IEMgMTUuMTM2NzE5IDIuNzIyNjU2IDE1LjEzNjcxOSAzLjYxMzI4MSAxNC41ODU5MzggNC4xNjQwNjIgWiBNIDguMzI4MTI1IDIuOTIxODc1IEwgMC42MzI4MTIgMTAuNjE3MTg4IEwgMC4wMTE3MTg4IDE0LjE3NTc4MSBDIC0wLjA3NDIxODggMTQuNjU2MjUgMC4zNDM3NSAxNS4wNzQyMTkgMC44MjgxMjUgMTQuOTkyMTg4IEwgNC4zODY3MTkgMTQuMzY3MTg4IEwgMTIuMDc4MTI1IDYuNjcxODc1IEMgMTIuMjE4NzUgNi41MzUxNTYgMTIuMjE4NzUgNi4zMTI1IDEyLjA3ODEyNSA2LjE3NTc4MSBMIDguODI4MTI1IDIuOTIxODc1IEMgOC42ODc1IDIuNzg1MTU2IDguNDY0ODQ0IDIuNzg1MTU2IDguMzI4MTI1IDIuOTIxODc1IFogTSAzLjYzNjcxOSA5Ljk1NzAzMSBDIDMuNDc2NTYyIDkuNzk2ODc1IDMuNDc2NTYyIDkuNTM5MDYyIDMuNjM2NzE5IDkuMzc4OTA2IEwgOC4xNDg0MzggNC44NjcxODggQyA4LjMwODU5NCA0LjcwMzEyNSA4LjU2NjQwNiA0LjcwMzEyNSA4LjcyNjU2MiA0Ljg2NzE4OCBDIDguODkwNjI1IDUuMDI3MzQ0IDguODkwNjI1IDUuMjg1MTU2IDguNzI2NTYyIDUuNDQ1MzEyIEwgNC4yMTQ4NDQgOS45NTcwMzEgQyA0LjA1NDY4OCAxMC4xMTcxODggMy43OTY4NzUgMTAuMTE3MTg4IDMuNjM2NzE5IDkuOTU3MDMxIFogTSAyLjU3ODEyNSAxMi40MjE4NzUgTCAzLjk4NDM3NSAxMi40MjE4NzUgTCAzLjk4NDM3NSAxMy40ODQzNzUgTCAyLjA5Mzc1IDEzLjgxNjQwNiBMIDEuMTgzNTk0IDEyLjkwNjI1IEwgMS41MTU2MjUgMTEuMDE1NjI1IEwgMi41NzgxMjUgMTEuMDE1NjI1IFogTSAyLjU3ODEyNSAxMi40MjE4NzUgIi8+CjwvZz4KPC9zdmc+Cg==',
      "eraser": 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTVwdCIgaGVpZ2h0PSIxNXB0IiB2aWV3Qm94PSIwIDAgMTUgMTUiIHZlcnNpb249IjEuMSI+CjxnIGlkPSJzdXJmYWNlMSI+CjxwYXRoIHN0eWxlPSIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDpyZ2IoMCUsMCUsMCUpO2ZpbGwtb3BhY2l0eToxOyIgZD0iTSAxNC41ODk4NDQgOC4wMjczNDQgQyAxNS4xMzY3MTkgNy40NzY1NjIgMTUuMTM2NzE5IDYuNTg1OTM4IDE0LjU4OTg0NCA2LjAzNTE1NiBMIDkuOTAyMzQ0IDEuMzQ3NjU2IEMgOS4zNTE1NjIgMC44MDA3ODEgOC40NjA5MzggMC44MDA3ODEgNy45MTAxNTYgMS4zNDc2NTYgTCAwLjQxMDE1NiA4Ljg0NzY1NiBDIC0wLjEzNjcxOSA5LjM5ODQzOCAtMC4xMzY3MTkgMTAuMjg5MDYyIDAuNDEwMTU2IDEwLjgzOTg0NCBMIDMuMjIyNjU2IDEzLjY1MjM0NCBDIDMuNDg4MjgxIDEzLjkxNDA2MiAzLjg0NzY1NiAxNC4wNjI1IDQuMjE4NzUgMTQuMDYyNSBMIDE0LjY0ODQzOCAxNC4wNjI1IEMgMTQuODQzNzUgMTQuMDYyNSAxNSAxMy45MDYyNSAxNSAxMy43MTA5MzggTCAxNSAxMi41MzkwNjIgQyAxNSAxMi4zNDM3NSAxNC44NDM3NSAxMi4xODc1IDE0LjY0ODQzOCAxMi4xODc1IEwgMTAuNDI1NzgxIDEyLjE4NzUgWiBNIDUuNzIyNjU2IDYuMTkxNDA2IEwgOS43NDYwOTQgMTAuMjE0ODQ0IEwgNy43NzM0MzggMTIuMTg3NSBMIDQuNDE0MDYyIDEyLjE4NzUgTCAyLjA3MDMxMiA5Ljg0Mzc1IFogTSA1LjcyMjY1NiA2LjE5MTQwNiAiLz4KPC9nPgo8L3N2Zz4K',
      "bucket": 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTZwdCIgaGVpZ2h0PSIxNXB0IiB2aWV3Qm94PSIwIDAgMTYgMTUiIHZlcnNpb249IjEuMSI+CjxnIGlkPSJzdXJmYWNlMSI+CjxwYXRoIHN0eWxlPSIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDpyZ2IoMCUsMCUsMCUpO2ZpbGwtb3BhY2l0eToxOyIgZD0iTSAxNC4yMjI2NTYgOS4zNzUgQyAxNC4yMjI2NTYgOS4zNzUgMTIuNDQ1MzEyIDEyLjA4OTg0NCAxMi40NDUzMTIgMTMuMTI1IEMgMTIuNDQ1MzEyIDE0LjE2MDE1NiAxMy4yNDIxODggMTUgMTQuMjIyNjU2IDE1IEMgMTUuMjAzMTI1IDE1IDE2IDE0LjE2MDE1NiAxNiAxMy4xMjUgQyAxNiAxMi4wODk4NDQgMTQuMjIyNjU2IDkuMzc1IDE0LjIyMjY1NiA5LjM3NSBaIE0gMTMuOTYwOTM4IDYuMzU5Mzc1IEwgOC4xOTE0MDYgMC4yNzM0MzggQyA4LjAxOTUzMSAwLjA4OTg0MzggNy43OTI5NjkgMCA3LjU2MjUgMCBDIDcuMzM1OTM4IDAgNy4xMDkzNzUgMC4wODk4NDM4IDYuOTM3NSAwLjI3MzQzOCBMIDQuNjY3OTY5IDIuNjY0MDYyIEwgMi4yNzczNDQgMC4xNDA2MjUgQyAyLjEwMTU2MiAtMC4wNDI5Njg4IDEuODIwMzEyIC0wLjA0Mjk2ODggMS42NDg0MzggMC4xNDA2MjUgTCAxLjAxOTUzMSAwLjgwMDc4MSBDIDAuODQ3NjU2IDAuOTg0Mzc1IDAuODQ3NjU2IDEuMjgxMjUgMS4wMTk1MzEgMS40NjQ4NDQgTCAzLjQxNDA2MiAzLjk4ODI4MSBMIDAuNzgxMjUgNi43NjU2MjUgQyAtMC4yNjE3MTkgNy44NjMyODEgLTAuMjYxNzE5IDkuNjQ0NTMxIDAuNzgxMjUgMTAuNzQyMTg4IEwgNC4wMzUxNTYgMTQuMTc1NzgxIEMgNC41NTg1OTQgMTQuNzI2NTYyIDUuMjM4MjgxIDE1IDUuOTIxODc1IDE1IEMgNi42MDU0NjkgMTUgNy4yODUxNTYgMTQuNzI2NTYyIDcuODA4NTk0IDE0LjE3NTc4MSBMIDEzLjk2MDkzOCA3LjY4MzU5NCBDIDE0LjMwODU5NCA3LjMyMDMxMiAxNC4zMDg1OTQgNi43MjY1NjIgMTMuOTYwOTM4IDYuMzU5Mzc1IFogTSAxMC43MzQzNzUgOC40Mzc1IEwgMS44MzIwMzEgOC40Mzc1IEMgMS44NzEwOTQgOC4zMjQyMTkgMS45Mjk2ODggOC4yMDMxMjUgMi4wMzkwNjIgOC4wOTM3NSBMIDIuNDAyMzQ0IDcuNzA3MDMxIEwgNC42NzE4NzUgNS4zMTY0MDYgTCA2LjI5Njg3NSA3LjAzMTI1IEMgNi42NDQ1MzEgNy4zOTg0MzggNy4yMDcwMzEgNy4zOTg0MzggNy41NTQ2ODggNy4wMzEyNSBDIDcuOTAyMzQ0IDYuNjY3OTY5IDcuOTAyMzQ0IDYuMDc0MjE5IDcuNTU0Njg4IDUuNzA3MDMxIEwgNS45MjU3ODEgMy45ODgyODEgTCA3LjU2MjUgMi4yNjE3MTkgTCAxMi4wNzgxMjUgNy4wMjM0MzggWiBNIDEwLjczNDM3NSA4LjQzNzUgIi8+CjwvZz4KPC9zdmc+Cg==',
      "pointer": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAT0lEQVQ4T7XTORIAIAgEweX/j9YiQ+VYSiUz6ElAwcWIsQOAfZfZHSugAx6mAxGmAhkuAxVOAwwOAyx2Ax18BLp4CXxZFXVlz85TQ/o56Jl5lw4QMYelVQAAAABJRU5ErkJggg=='
    };
    if (tool in tools) {
      this.canvas.style.cursor = `url(${tools[tool]}), auto`;
    } else {
      this.canvas.style.cursor = 'crosshair';
    }
    
  }

  // returns a MediaStream of canvas
  getStream() {
    return this.canvas.captureStream();
  }

  // returns an image of the current state of canvas
  getImage() {
    return this.canvas.toDataURL('image/png', 1.0);
  }

  initialize() {
    this.canvas.onmousedown = this.onMouseDown.bind(this);
    this.canvas.ontouchstart = this.onMouseDown.bind(this);
    this.canvas.onmouseup = this.onMouseUp.bind(this);
    this.canvas.ontouchend = this.onMouseUp.bind(this);
    window.onkeydown = this.handleShortcutKeys.bind(this);
    this.updateFrameInterval = window.app.updateCanvasFrame();
    this.tools = new Tools();
    this.onScroll();
    this.handleResize();
  }

  paintWhite() {
    window.app.paintBackgroundWhite();
  }

  onMouseDown() {
    clearInterval(this.updateFrameInterval);
    console.log('ferramenta',this.tool);
    this.pushToUndoStack();
    this.clearRedoStack();
  }

  onMouseUp() {
    this.updateFrameInterval = window.app.updateCanvasFrame();
    document.onmouseup = null;
    document.ontouchend = null;
  }

  onScroll(e, offsetX, offsetY) {
    window.app.zoom(e, offsetX, offsetY);
  }

  getZoom() {
    return window.app.getZoomData();
  }

  cloneItem() {
    window.app.copyItem();
  }

  deleteItem() {
    window.app.deleteItem();
  }

  handleResize() {
    let timeout;
    const onResizeDone = () => {
      handleBoardsViewButtonsDisplay();
    };
    $(window).on('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(onResizeDone, 20);
    });
  }

  handleShortcutKeys(e) {
    if (e.key === 'c' && e.ctrlKey) {
      this.cloneItem();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      this.pushToUndoStack();
      this.deleteItem();
    } else if (e.key === 'z' && e.ctrlKey) {
      this.undoPaint();
    } else if (e.key === 'y' && e.ctrlKey) {
      this.redoPaint();
    }
  }

  undoPaint() {
    if (this.undoStack.length > 0) {
      // this.context.putImageData(this.undoStack.pop(), 0, 0);
      this.pushToRedoStack();
      const draws = this.undoStack.pop();
      window.app.drawProject(draws);
    } else {
      showInfoMessage($('#nothing-to-undo').val());
    }
  }

  setPaths(array) {
    window.app.drawProject(array);
  }

  redoPaint() {
    if (this.redoStack.length > 0) {
      this.pushToUndoStack();
      const draws = this.redoStack.pop();
      window.app.drawProject(draws);
    } else {
      showInfoMessage($('#nothing-to-redo').val());
    }
  }

  clearRedoStack() {
    this.redoStack = [];
  }

  clearCanvas() {
    // make the canvass a blank page
    window.app.clear();
  }

  getSvgImage() {
    return window.app.saveSVG();
  }

  setCurrentBoard(img) {
    window.app.clear();
    this.context.drawImage(img, 0, 0);
    window.app.setBackground(img.src);
  }

  makeNewBoard() {
    return new Board(window.app.saveProject(), this.getImage());
  }

  pushToUndoStack() {
    var undoLimit = 40;
    this.saveData = window.app.saveProject();
    if (this.undoStack.length >= undoLimit) this.undoStack.shift();
    this.undoStack.push(this.saveData);
  }

  pushToRedoStack() {
    var redoLimit = 40;
    this.saveData = window.app.saveProject();
    if (this.undoStack.length >= redoLimit) this.redoStack.shift();
    this.redoStack.push(this.saveData);
  }

  addImg(imgSrc){
    this.pushToUndoStack();
    this.clearRedoStack();
    window.app.addImg(imgSrc)
  }
}
