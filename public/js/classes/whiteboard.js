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

import {
  getMouseCoordsOnCanvas, findDistance, dragifyImage,
} from '../utility.js';
import Fill from './fill.js';
import Point from './point.js';

const DEFAULT_COLOR = '#424242';

export default class Whiteboard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.context = this.canvas.getContext('2d');
    this.canvas.ondragover = (ev) => ev.preventDefault();
    this.canvas.ondrop = this.onDrop.bind(this);
    this.canvas.style.cursor = 'crosshair';
    this.currentBoard = 0;
    this.paintWhite();
    this.boards = [];
    this.undoStack = [];
    this.startingPoint = new Point();
    this.endPoint = new Point();
    this.isSelectionActive = false;
    // window.onkeydown = this.handleShortcutKeys.bind(this);
  }

  selectionTransformation() {
    if (this.isSelectionActive) {
      this.isSelectionActive = false;
      this.undoPaint();
    }

    let imgData;
    this.updateSelectionDirection();
    const imgElem = document.createElement('img');
    const correctionOffset = 0.5;
    switch (this.selectionDirection) {
      case 'DOWN_RIGHT':
        imgData = this.context.getImageData(this.startingPoint.x + 1, this.startingPoint.y + 1,
          (this.endPoint.x - this.startingPoint.x) - 2, this.endPoint.y - this.startingPoint.y - 2);
        imgElem.style.top = `${this.startingPoint.y - correctionOffset}px`;
        imgElem.style.left = `${this.startingPoint.x - correctionOffset}px`;
        break;
      case 'UP_RIGHT':
        imgData = this.context.getImageData(this.startingPoint.x + 1, this.endPoint.y + 1,
          (this.endPoint.x - this.startingPoint.x) - 2, this.startingPoint.y - this.endPoint.y - 2);
        imgElem.style.top = `${this.endPoint.y - correctionOffset}px`;
        imgElem.style.left = `${this.startingPoint.x - correctionOffset}px`;
        break;
      case 'DOWN_LEFT':
        imgData = this.context.getImageData(this.endPoint.x + 1, this.startingPoint.y + 1,
          (this.startingPoint.x - this.endPoint.x) - 2, this.endPoint.y - this.startingPoint.y - 2);
        imgElem.style.top = `${this.startingPoint.y - correctionOffset}px`;
        imgElem.style.left = `${this.endPoint.x - correctionOffset}px`;
        break;
      case 'UP_LEFT':
        imgData = this.context.getImageData(this.endPoint.x + 1, this.endPoint.y + 1,
          (this.startingPoint.x - this.endPoint.x) - 2, this.startingPoint.y - this.endPoint.y - 2);
        imgElem.style.top = `${this.endPoint.y - correctionOffset}px`;
        imgElem.style.left = `${this.endPoint.x - correctionOffset}px`;
        break;
      default: return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    ctx.putImageData(imgData, 0, 0);
    imgElem.src = canvas.toDataURL();
    dragifyImage(imgElem);
    this.isSelectionActive = true;
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
    this.removeSelectedRegion();

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

  onDrop(ev) {
    ev.preventDefault();
    const img = new Image();
    img.style.top = `${ev.clientY}px`;
    img.style.left = `${ev.clientX}px`;
    img.src = ev.dataTransfer.getData('text/plain');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    const imgData = context.getImageData(0, 0, img.width, img.height);
    this.context.putImageData(imgData, ev.clientX, ev.clientY);
    this.removeSelectedRegion();
    switch (this.selectionDirection) {
      case 'DOWN_RIGHT':
        this.context.fillRect(this.startingPoint.x, this.startingPoint.y,
          img.width, img.height);
        break;
      case 'UP_RIGHT':
        this.context.fillRect(this.startingPoint.x, this.endPoint.y,
          img.width, img.height);
        break;
      case 'DOWN_LEFT':
        this.context.fillRect(this.endPoint.x, this.startingPoint.y,
          img.width, img.height);
        break;
      case 'UP_LEFT':
        this.context.fillRect(this.endPoint.x, this.endPoint.y,
          img.width, img.height);
        break;
      default: break;
    }
    this.startingPoint = new Point(ev.clientX, ev.clientY);
    this.endPoint = new Point(ev.clientX + img.width, ev.clientY + img.height);
    this.selectionDirection = 'DOWN_RIGHT';
    dragifyImage(img);
    this.isSelectionActive = true;
    this.pushToUndoStack();
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
    this.removeSelectedRegion();
    this.isSelectionActive = false;
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
    const undoLimit = 40;
    this.saveData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    if (this.undoStack.length >= undoLimit) this.undoStack.shift();
    this.undoStack.push(this.saveData);
  }

  removeSelectedRegion() {
    document.querySelectorAll('.selected-area-img').forEach((elem) => {
      elem.parentNode.removeChild(elem);
    });
    this.isSelectionActive = false;
  }

  updateSelectionDirection() {
    const start = this.startingPoint;
    const end = this.endPoint;
    this.selectionDirection = null;
    /* TAKE CARE OF ALL DIRECTIONS POSSIBLE FOR DRAG AND DROP COPYING FUNCIOTIONALITY */
    if (start.x < end.x && start.y < end.y) {
      this.selectionDirection = 'DOWN_RIGHT';
    } else if (start.x < end.x && start.y > end.y) {
      this.selectionDirection = 'UP_RIGHT';
    } else if (start.x > end.x && start.y < end.y) {
      this.selectionDirection = 'DOWN_LEFT';
    } else if (start.x > end.x && start.y > end.y) {
      this.selectionDirection = 'UP_LEFT';
    }
  }
}
