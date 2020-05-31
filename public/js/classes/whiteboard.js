/* eslint-disable no-new */
/* eslint-disable no-shadow */
/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
import {
  TOOL_CIRCLE, TOOL_LINE, TOOL_BRUSH,
  TOOL_ERASER, TOOL_PAINT_BUCKET, TOOL_PENCIL,
  TOOL_SQUARE, TOOL_TRIANGLE,
} from '../tools.js';

import { getMouseCoordsOnCanvas, findDistance } from '../utility.js';
import Fill from './fill.js';

export default class Whiteboard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.context = this.canvas.getContext('2d');
    this.currentBoard = 0;
    this.paintWhite();
    this.boards = [];
    this.undoStack = [];
    this.undoLimit = 10; // limit for the stack
  }

  set activeTool(tool) {
    this.tool = tool;
  }

  set lineWidth(lineWidth) {
    this._lineWidth = lineWidth; // "_" for no conflict in between the two
    this.context.lineWidth = this._lineWidth;
  }


  set brushSize(brushSize) {
    this._brushSize = brushSize;
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
    this.activeTool = TOOL_BRUSH;
    this.lineWidth = 1;
    this.brushSize = 4;
    this.selectedColor = '#000000';
    this.canvas.onmousedown = (e) => this.onMouseDown(e);
  }

  paintWhite() {
    this.context.fillStyle = 'white';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  onMouseDown(e) {
    // store the image so that we can replicate it with every mouse move.
    this.saveData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    // undo portion (2L)
    if (this.undoStack.length >= this.undoLimit) this.undoStack.shift();
    this.undoStack.push(this.saveData);


    this.canvas.onmousemove = (e) => this.onMouseMove(e);
    document.onmouseup = (e) => this.onMouseUp(e);

    this.startPos = getMouseCoordsOnCanvas(e, this.canvas); // NaN here

    if (this.tool === TOOL_PENCIL || this.tool === TOOL_BRUSH) {
      // begin path again and again for good quality
      this.context.beginPath();
      this.context.moveTo(this.startPos.x, this.startPos.y);
    } else if (this.tool === TOOL_PAINT_BUCKET) {
      // in this case, we will implement the flood fill algorithm
      new Fill(this.canvas, this.startPos, this._color);
    } else if (this.tool === TOOL_ERASER) {
      this.context.clearRect(this.startPos.x, this.startPos.y,
        this._brushSize, this._brushSize);
    }
  }


  onMouseMove(e) {
    this.currentPos = getMouseCoordsOnCanvas(e, this.canvas);

    // loop for every shape at the user's disposal
    switch (this.tool) {
      case TOOL_LINE:
      case TOOL_SQUARE:
      case TOOL_CIRCLE:
      case TOOL_TRIANGLE:
        this.drawShape(); // nothing showed up here, might glitch
        break;
      case TOOL_PENCIL:
        this.drawFreeLine(this._lineWidth);
        break;
      case TOOL_BRUSH:
        this.drawFreeLine(this._brushSize);
        break;
      case TOOL_ERASER:
        this.context.clearRect(this.currentPos.x, this.currentPos.y,
          this._brushSize, this._brushSize);
        break;
      default:
        break;
    }
  }

  onMouseUp() {
    this.canvas.onmousemove = null;
    document.onmouseup = null;
  }

  // shape drawing functions
  drawShape() {
    this.context.putImageData(this.saveData, 0, 0);

    this.context.beginPath();

    if (this.tool === TOOL_LINE) {
      this.context.moveTo(this.startPos.x, this.startPos.y);
      this.context.lineTo(this.currentPos.x, this.currentPos.y);
    } else if (this.tool === TOOL_SQUARE) {
      this.context.rect(this.startPos.x, this.startPos.y,
        this.currentPos.x - this.startPos.x, this.currentPos.y - this.startPos.y);
    } else if (this.tool === TOOL_CIRCLE) {
      // variables to make it clear what is happening
      const start = this.startPos;
      const finish = this.currentPos;

      const distance = findDistance(start, finish);
      this.context.arc(this.startPos.x, this.startPos.y, distance, 0, 2 * Math.PI, false);
    } else if (this.tool === TOOL_TRIANGLE) {
      this.context.moveTo(this.startPos.x + (this.currentPos.x - this.startPos.x) / 2,
        this.startPos.y);
      this.context.lineTo(this.startPos.x, this.currentPos.y);
      this.context.lineTo(this.currentPos.x, this.currentPos.y);
      this.context.closePath();
    }

    this.context.stroke();
  }

  drawFreeLine(lineWidth) {
    this.context.lineWidth = lineWidth;
    this.context.lineTo(this.currentPos.x, this.currentPos.y);
    this.context.stroke();
  }

  undoPaint() {
    if (this.undoStack.length > 0) {
      this.context.putImageData(this.undoStack.pop(), 0, 0);
    } else {
      alert('No drawing to be undone');
    }
  }

  clearCanvas() {
    // make the canvass a blank page
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.paintWhite();
  }

  setCurrentBoard(img) {
    this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
  }
}
