/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-new */
/* eslint-disable no-shadow */
/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
import {
  TOOL_CIRCLE, TOOL_LINE,
  TOOL_ERASER, TOOL_PAINT_BUCKET, TOOL_PENCIL,
  TOOL_SQUARE, TOOL_TRIANGLE, TOOL_SELECTAREA,
} from '../tools.js';

import { getMouseCoordsOnCanvas, findDistance } from '../utility.js';
import Fill from './fill.js';

// MAIN COLOR
const DEFAULT_COLOR = '#424242';

export default class Whiteboard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.context = this.canvas.getContext('2d');
    this.canvas.ondragover = (ev) => ev.preventDefault();
    this.canvas.ondrop = (ev) => {
      ev.preventDefault();
      const img = new Image();
      img.src = ev.dataTransfer.getData('text/plain');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      const imgData = context.getImageData(0, 0, img.width, img.height);
      if (this.isSelectionActive) {
        this.isSelectionActive = false;
        this.undoPaint();
      }
      this.context.putImageData(imgData, ev.clientX, ev.clientY);
      this.pushToUndoStack();
    };
    this.canvas.style.cursor = 'crosshair';
    this.currentBoard = 0;
    this.paintWhite();
    this.boards = [];
    this.undoStack = [];
    this.undoLimit = 40; // limit for the stack
    this.startingPoint = { x: 0, y: 0 }; // operations with delete, copy, and paste functionalities
    this.endPoint = { x: 0, y: 0 };
    this.isSelectionActive = false;
    this.rectDeleted = false;
  }

  set activeTool(tool) {
    this.tool = tool;
  }

  set lineWidth(lineWidth) {
    this._lineWidth = lineWidth; // "_" for no conflict in between the two
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
    this.activeTool = TOOL_PENCIL;
    this.lineWidth = 3;
    this.selectedColor = DEFAULT_COLOR;
    this.canvas.onmousedown = (e) => this.onMouseDown(e);
  }

  paintWhite() {
    this.context.fillStyle = 'white';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  onMouseDown(e) {
    document.querySelectorAll('.selected-area-img').forEach((elem) => {
      elem.parentNode.removeChild(elem);
    });

    if (this.isSelectionActive && this.undoStack.length > 0) {
      this.isSelectionActive = false;
      this.undoPaint();
    }

    this.pushToUndoStack();

    this.canvas.onmousemove = (e) => this.onMouseMove(e);
    document.onmouseup = (e) => this.onMouseUp(e);

    this.startPos = getMouseCoordsOnCanvas(e, this.canvas); // NaN here

    switch (this.tool) {
      case TOOL_PENCIL:
        // begin path again and again for good quality
        this.context.beginPath();
        this.context.moveTo(this.startPos.x, this.startPos.y);
        break;
      case TOOL_PAINT_BUCKET:
        // in this case, we will implement the flood fill algorithm
        new Fill(this.canvas, this.startPos, this._color);
        break;
      default: break;
    }
  }


  onMouseMove(e) {
    this.currentPos = getMouseCoordsOnCanvas(e, this.canvas);

    // loop for every shape at the user's disposal
    switch (this.tool) {
      case TOOL_SELECTAREA:
      case TOOL_LINE:
      case TOOL_SQUARE:
      case TOOL_CIRCLE:
      case TOOL_TRIANGLE:
        this.drawShape();
        break;
      case TOOL_PENCIL:
        this.drawFreeLine(this._lineWidth);
        break;
      case TOOL_ERASER:
        // make eraser thickness be greater than thickness of pencil by 5px
        this.context.fillRect(this.currentPos.x, this.currentPos.y,
          this._lineWidth + 5, this._lineWidth + 5);
        break;
      default:
        break;
    }
  }

  onMouseUp() {
    this.canvas.onmousemove = null;
    document.onmouseup = null;

    if (this.tool === TOOL_SELECTAREA) {
      this.context.strokeStyle = this._color;
      this.context.setLineDash([]);
      this.context.lineWidth = this._lineWidth;
      if (!this.isSelectionActive) {
        this.isSelectionActive = true;
      }
      this.selectionTransformation();
    }
  }

  // shape drawing functions
  drawShape() {
    this.context.putImageData(this.saveData, 0, 0);

    this.context.beginPath();

    switch (this.tool) {
      case TOOL_LINE:
        this.context.moveTo(this.startPos.x, this.startPos.y);
        this.context.lineTo(this.currentPos.x, this.currentPos.y);
        break;
      case TOOL_SQUARE:
        this.context.rect(this.startPos.x, this.startPos.y,
          this.currentPos.x - this.startPos.x, this.currentPos.y - this.startPos.y);
        break;
      case TOOL_CIRCLE:
        // variables to make it clear what is happening
        const start = this.startPos;
        const finish = this.currentPos;

        const distance = findDistance(start, finish);
        this.context.arc(this.startPos.x, this.startPos.y, distance, 0, 2 * Math.PI, false);
        break;
      case TOOL_TRIANGLE:
        this.context.moveTo(this.startPos.x + (this.currentPos.x - this.startPos.x) / 2,
          this.startPos.y);
        this.context.lineTo(this.startPos.x, this.currentPos.y);
        this.context.lineTo(this.currentPos.x, this.currentPos.y);
        this.context.closePath();
        break;
      case TOOL_SELECTAREA:
        this.context.strokeStyle = 'gray';
        this.context.lineWidth = 1;
        this.context.setLineDash([5, 3]);
        this.context.rect(this.startPos.x, this.startPos.y,
          this.currentPos.x - this.startPos.x, this.currentPos.y - this.startPos.y);
        this.startingPoint.x = this.startPos.x;
        this.startingPoint.y = this.startPos.y;
        this.endPoint.x = this.currentPos.x;
        this.endPoint.y = this.currentPos.y;
        break;
      default:
        break;
    }

    this.context.stroke();
  }

  drawFreeLine(lineWidth) {
    this.context.lineWidth = lineWidth;
    this.context.lineTo(this.currentPos.x, this.currentPos.y);
    this.context.stroke();
  }

  undoPaint() {
    this.isSelectionActive = this.isSelectionActive && false; // careful to not be a boolean value
    if (this.undoStack.length > 0) {
      this.context.putImageData(this.undoStack.pop(), 0, 0);
    }
  }

  clearCanvas() {
    // make the canvass a blank page
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.paintWhite();
  }

  setCurrentBoard(img) {
    this.context.drawImage(img, 0, 0);
  }

  pushToUndoStack() {
    this.saveData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    if (this.undoStack.length >= this.undoLimit) this.undoStack.shift();
    this.undoStack.push(this.saveData);
  }

  selectionTransformation() {
    if (this.isSelectionActive) {
      this.isSelectionActive = false;
      this.undoPaint();
    }
    const start = this.startingPoint;
    const end = this.endPoint;
    let selectionDirection;
    /* TAKE CARE OF ALL DIRECTIONS POSSIBLE FOR DRAG AND DROP COPYING FUNCIOTIONALITY */
    let imgData;
    if (start.x < end.x && start.y < end.y) { // start high go down, right (good)
      imgData = this.context.getImageData(start.x + 1, start.y + 1,
        (end.x - start.x) - 2, (end.y - start.y) - 2);
      selectionDirection = 'DOWN_RIGHT';
      // context.putImageData(test, start.x + 20, start.y + 20); (this works...... ish)
    } else if (start.x < end.x && start.y > end.y) { // start low, go up, right (good)
      imgData = this.context.getImageData(start.x + 1, end.y + 1,
        (end.x - start.x) - 2, (start.y - end.y) - 2);
      selectionDirection = 'UP_RIGHT';
    } else if (start.x > end.x && start.y < end.y) { // start high, go down, left (good)
      imgData = this.context.getImageData(end.x + 1, start.y + 1,
        (start.x - end.x) - 2, (end.y - start.y) - 2);
      selectionDirection = 'DOWN_LEFT';
    } else if (start.x > end.x && start.y > end.y) { // start low, go up, left (good)
      imgData = this.context.getImageData(end.x + 1, end.y + 1,
        (start.x - end.x) - 2, (start.y - end.y) - 2);
      selectionDirection = 'UP_LEFT';
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    ctx.putImageData(imgData, 0, 0);
    const imgElem = document.createElement('img');
    imgElem.src = canvas.toDataURL();
    imgElem.classList.add('selected-area-img');
    switch (selectionDirection) {
      case 'DOWN_RIGHT':
        imgElem.style.top = `${this.startingPoint.y}px`;
        imgElem.style.left = `${this.startingPoint.x}px`;
        break;
      case 'UP_RIGHT':
        imgElem.style.top = `${this.endPoint.y}px`;
        imgElem.style.left = `${this.startingPoint.x}px`;
        break;
      case 'DOWN_LEFT':
        imgElem.style.top = `${this.startingPoint.y}px`;
        imgElem.style.left = `${this.endPoint.x}px`;
        break;
      case 'UP_LEFT':
        imgElem.style.top = `${this.endPoint.y}px`;
        imgElem.style.left = `${this.endPoint.x}px`;
        break;
      default: break;
    }

    imgElem.draggable = true;
    imgElem.ondragstart = (ev) => {
      ev.dataTransfer.setDragImage(ev.target, 10, 10);
      ev.dataTransfer.dropEffect = 'move';
    };
    document.getElementsByTagName('BODY')[0].appendChild(imgElem);
  }
}
