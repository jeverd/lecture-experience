/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-var */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-new */
/* eslint-disable no-shadow */
/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */

import { getMouseCoordsOnCanvas, showInfoMessage } from '../utility.js';
import { handleBoardsViewButtonsDisplay } from '../manager/managerBoards.js';
import Fill from './fill.js';
import Point from './point.js';
import Tools from './Tools.js';

const DEFAULT_COLOR = '#424242';

export default class Whiteboard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.context = this.canvas.getContext('2d');
    this.canvas.style.cursor = 'crosshair';
    this.tools = new Tools();
    this.currentBoard = 0;
    this.onScroll();
    this.paintWhite();
    this.boards = [];
    this.paths = [];
    this.centerCoords = [];
    this.undoStack = [];
    this.redoStack = [];
    this.startingPoint = new Point();
    this.endPoint = new Point();
    this.isSelectionActive = false;
    window.onkeydown = this.handleShortcutKeys.bind(this);
    this.handleResize();
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

  // returns a MediaStream of canvas
  getStream() {
    return this.canvas.captureStream();
  }

  // returns an image of the current state of canvas
  getImage() {
    return this.canvas.toDataURL('image/png', 1.0).replace('image.png', 'image/octet-stream');
  }

  initialize() {
    this.canvas.onmousedown = this.onMouseDown.bind(this);
    this.canvas.ontouchstart = this.onMouseDown.bind(this);
  }

  paintWhite() {
    window.app.paintBackgroundWhite();
  }

  onMouseDown(e) {
    this.pushToUndoStack();
    this.clearRedoStack();

    this.startPos = getMouseCoordsOnCanvas(e, this.canvas); // NaN here
  }

  onMouseUp() {
    this.canvas.onmousemove = (e) => {
      this.currentPos = getMouseCoordsOnCanvas(e, this.canvas);
      this.pushToUndoStack();
    };
    this.canvas.ontouchmove = (e) => {
      this.currentPos = getMouseCoordsOnCanvas(e, this.canvas);
      this.pushToUndoStack();
    };
    document.onmouseup = null;
    document.ontouchend = null;
  }

  onScroll(e, x, y) {
    window.app.zoom(e, x, y);
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
      this.paintWhite();
      this.setCurrentBoard(inMemCanvas);
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
      window.app.addDraws(draws);
    } else {
      showInfoMessage('Nothing to undo.');
    }
  }

  setPaths(array) {
    window.app.addDraws(array);
  }

  redoPaint() {
    if (this.redoStack.length > 0) {
      this.pushToUndoStack();
      const draws = this.redoStack.pop();
      window.app.addDraws(draws);
    } else {
      showInfoMessage('Nothing to redo.');
    }
  }

  clearRedoStack() {
    this.redoStack = [];
  }

  clearCanvas() {
    // make the canvass a blank page
    window.app.paintCircle();
  }

  getSvgImage() {
    return window.app.saveSVG();
  }

  setCurrentBoard(img) {
    window.app.paintCircle();
    this.context.drawImage(img, 0, 0);
    window.app.setBackground(img.src);
  }

  getDraws() {
    var array = [];
    for (var i in window.app.getElem()) {
      const completePath = window.app.getElem()[i];
      array.push([completePath.pathData, completePath.strokeColor, completePath.strokeWidth]);
    }
    return array;
  }

  pushToUndoStack() {
    var undoLimit = 40;
    var array = [];
    for (var i in window.app.getElem()) {
      const completePath = window.app.getElem()[i];
      array.push([completePath.pathData, completePath.strokeColor, completePath.strokeWidth]);
    }
    this.saveData = array;
    if (this.undoStack.length >= undoLimit) this.undoStack.shift();
    this.undoStack.push(this.saveData);
  }

  pushToRedoStack() {
    var redoLimit = 40;
    var array = [];
    for (var i in window.app.getElem()) {
      const completePath = window.app.getElem()[i];
      array.push([completePath.pathData, completePath.strokeColor, completePath.strokeWidth]);
    }
    this.saveData = array;
    if (this.undoStack.length >= redoLimit) this.redoStack.shift();
    this.redoStack.push(this.saveData);
  }
}
