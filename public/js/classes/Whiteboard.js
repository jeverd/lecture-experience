import { showInfoMessage } from '../utility.js';
import { handleBoardsViewButtonsDisplay } from '../manager/managerBoards.js';
import Tools, {  ToolsImages } from './Tools.js';
import Board from './Board.js';

export default class Whiteboard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.context = this.canvas.getContext('2d');
    this.updateCursor('pencil');
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
    this.canvas.style.cursor = tool in ToolsImages ? `url(${ToolsImages[tool]}), auto` : 'crosshair';
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

  setZoom(point) {
    window.app.setZoom(point);
  }

  onMouseDown() {
    clearInterval(this.updateFrameInterval);
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

  makeNewBoard(zoom = null) {
    return new Board(window.app.saveProject(), this.getImage(), zoom);
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
