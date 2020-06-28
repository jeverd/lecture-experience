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
  getMouseCoordsOnCanvas, findDistance,
  getImgElemFromImgData, getImgDataFromImgElem,
  showInfoMessage,
} from '../utility.js';
import { handleBoardsViewButtonsDisplay } from '../managerBoards.js';
import Fill from './fill.js';
import Point from './point.js';

const DEFAULT_COLOR = '#424242';

export default class Whiteboard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.context = this.canvas.getContext('2d');
    this.canvas.style.cursor = 'crosshair';
    this.currentBoard = 0;
    this.paintWhite();
    this.boards = [];
    this.undoStack = [];
    this.redoStack = [];
    this.startingPoint = new Point();
    this.endPoint = new Point();
    this.isSelectionActive = false;
    window.onkeydown = this.handleShortcutKeys.bind(this);
    this.canvas.ondragover = (ev) => ev.preventDefault();
    this.canvas.ondrop = this.onDrop.bind(this);
    this.handleResize();
    this.selectedRegionActionMap = {
      DOWN_RIGHT: {
        CLEAR: () => this.context.fillRect(this.startingPoint.x, this.startingPoint.y,
          this.endPoint.x - this.startingPoint.x, this.endPoint.y - this.startingPoint.y),
        COPY: () => this.context.getImageData(this.startingPoint.x, this.startingPoint.y,
          this.endPoint.x - this.startingPoint.x, this.endPoint.y - this.startingPoint.y),
        GET_STARTING_POINT: () => new Point(this.startingPoint.x - 0.5, this.startingPoint.y - 0.5),
      },
      UP_RIGHT: {
        CLEAR: () => this.context.fillRect(this.startingPoint.x, this.endPoint.y,
          this.endPoint.x - this.startingPoint.x, this.startingPoint.y - this.endPoint.y),
        COPY: () => this.context.getImageData(this.startingPoint.x, this.endPoint.y,
          this.endPoint.x - this.startingPoint.x, this.startingPoint.y - this.endPoint.y),
        GET_STARTING_POINT: () => new Point(this.startingPoint.x - 0.5, this.endPoint.y - 0.5),
      },
      DOWN_LEFT: {
        CLEAR: () => this.context.fillRect(this.endPoint.x, this.startingPoint.y,
          this.startingPoint.x - this.endPoint.x, this.endPoint.y - this.startingPoint.y),
        COPY: () => this.context.getImageData(this.endPoint.x, this.startingPoint.y,
          (this.startingPoint.x - this.endPoint.x), (this.endPoint.y - this.startingPoint.y)),
        GET_STARTING_POINT: () => new Point(this.endPoint.x - 0.5, this.startingPoint.y - 0.5),
      },
      UP_LEFT: {
        CLEAR: () => this.context.fillRect(this.endPoint.x, this.endPoint.y,
          this.startingPoint.x - this.endPoint.x, this.startingPoint.y - this.endPoint.y),
        COPY: () => this.context.getImageData(this.endPoint.x, this.endPoint.y,
          (this.startingPoint.x - this.endPoint.x), this.startingPoint.y - this.endPoint.y),
        GET_STARTING_POINT: () => new Point(this.endPoint.x - 0.5, this.endPoint.y - 0.5),
      },
    };
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
    this.activeTool = TOOL_PENCIL;
    this.lineWidth = 3;
    this.selectedColor = DEFAULT_COLOR;
    this.canvas.onmousedown = this.onMouseDown.bind(this);
    this.canvas.ontouchstart = this.onMouseDown.bind(this);
  }

  paintWhite() {
    this.context.fillStyle = 'white';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  onMouseDown(e) {
    this.removeSelectedRegion();

    this.pushToUndoStack();

    this.canvas.onmousemove = this.onMouseMove.bind(this);
    this.canvas.addEventListener('touchmove', this.onMouseMove.bind(this), false);
    document.onmouseup = this.onMouseUp.bind(this);
    document.ontouchend = this.onMouseUp.bind(this);

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
    e.preventDefault();
    this.currentPos = getMouseCoordsOnCanvas(e, this.canvas);
    if (this.tool !== TOOL_SELECTAREA) {
      this.redoStack = [];
    }

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
    this.canvas.onmousemove = (e) => {
      this.currentPos = getMouseCoordsOnCanvas(e, this.canvas);
    };
    this.canvas.ontouchmove = (e) => {
      this.currentPos = getMouseCoordsOnCanvas(e, this.canvas);
    };
    document.onmouseup = null;
    document.ontouchend = null;

    if (this.tool === TOOL_SELECTAREA) {
      this.context.strokeStyle = this._color;
      this.context.setLineDash([]);
      this.context.lineWidth = this._lineWidth;
      this.selectionTransformation();
    }
  }

  pasteRegion(img, x, y) {
    const imgData = getImgDataFromImgElem(img);
    this.context.putImageData(imgData, x, y);
    this.removeSelectedRegion();
    this.startingPoint = new Point(x, y);
    this.endPoint = new Point(x + img.width, y + img.height);
    this.selectionDirection = 'DOWN_RIGHT';
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    this.dragifySelectedRegion(img);
    this.pushToUndoStack();
  }

  onDrop(ev) {
    ev.preventDefault();
    if (this.selectionDirection) {
      this.redoStack = [];
      const img = new Image();
      img.src = ev.dataTransfer.getData('text/plain');
      this.selectedRegionActionMap[this.selectionDirection].CLEAR();
      this.pasteRegion(img, ev.clientX, ev.clientY);
    }
  }

  handleResize() {
    let timeout;
    let isStartingToResize = true;
    const inMemCanvas = document.createElement('canvas');
    const inMemCtx = inMemCanvas.getContext('2d');
    const onResizeDone = () => {
      this.canvas.height = window.innerHeight;
      this.canvas.width = window.innerWidth;
      this.paintWhite();
      this.setCurrentBoard(inMemCanvas);
      handleBoardsViewButtonsDisplay();
      isStartingToResize = true;
    };
    // eslint-disable-next-line no-undef
    $(window).on('resize', () => {
      if (isStartingToResize) {
        inMemCanvas.width = this.canvas.width;
        inMemCanvas.height = this.canvas.height;
        inMemCtx.drawImage(this.canvas, 0, 0);
        isStartingToResize = false;
      }
      clearTimeout(timeout);
      timeout = setTimeout(onResizeDone, 100);
    });
  }

  handleShortcutKeys(e) {
    this.updateSelectionDirection();
    if (this.isSelectionActive && this.selectionDirection !== null) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        this.selectedRegionActionMap[this.selectionDirection].CLEAR();
        this.removeSelectedRegion();
      } else if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        const imgData = this.selectedRegionActionMap[this.selectionDirection].COPY();
        this.removeSelectedRegion();
        const imgElem = getImgElemFromImgData(imgData);
        this.startingPoint = new Point(this.canvas.width / 2 + 100, this.canvas.height / 2 - 50);
        this.endPoint = new Point(this.startingPoint.x + imgElem.width,
          this.startingPoint.y + imgElem.height);
        imgElem.style.left = `${this.startingPoint.x}px`;
        imgElem.style.top = `${this.startingPoint.y}px`;
        this.dragifySelectedRegion(imgElem);
        this.context.putImageData(imgData, this.startingPoint.x, this.startingPoint.y);
      } else if (e.key === 'c' && e.ctrlKey) {
        this.copiedRegionData = this.selectedRegionActionMap[this.selectionDirection].COPY();
        showInfoMessage('Copied! Press Ctrl + V to paste.');
      } else if (e.key === 'x' && e.ctrlKey) {
        this.copiedRegionData = this.selectedRegionActionMap[this.selectionDirection].COPY();
        this.selectedRegionActionMap[this.selectionDirection].CLEAR();
        this.removeSelectedRegion();
      }
    }
    if (e.key === 'v' && e.ctrlKey && this.copiedRegionData) {
      const img = getImgElemFromImgData(this.copiedRegionData);
      this.pasteRegion(img, this.currentPos.x, this.currentPos.y);
    } else if (e.key === 'z' && e.ctrlKey) {
      this.undoPaint();
    } else if (e.key === 'y' && e.ctrlKey) {
      this.redoPaint();
    }
  }

  selectionTransformation() {
    this.undoPaint();
    this.updateSelectionDirection();
    if (this.selectionDirection) {
      const imgData = this.selectedRegionActionMap[this.selectionDirection].COPY();
      const imgElem = getImgElemFromImgData(imgData);
      const point = this.selectedRegionActionMap[this.selectionDirection].GET_STARTING_POINT();
      imgElem.style.top = `${point.y}px`;
      imgElem.style.left = `${point.x}px`;
      this.dragifySelectedRegion(imgElem);
    } else {
      this.removeSelectedRegion();
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
    const currentBoard = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    this.removeSelectedRegion();
    if (this.undoStack.length > 0) {
      this.redoStack.push(currentBoard);
      this.context.putImageData(this.undoStack.pop(), 0, 0);
    } else {
      showInfoMessage('Nothing to undo.');
    }
  }

  redoPaint() {
    if (this.redoStack.length > 0) {
      this.removeSelectedRegion();
      const currentBoard = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.undoStack.push(currentBoard);
      this.context.putImageData(this.redoStack.pop(), 0, 0);
    } else {
      showInfoMessage('Nothing to redo.');
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

  dragifySelectedRegion(imgElem) {
    imgElem.classList.add('selected-area-img');
    imgElem.draggable = true;
    imgElem.oncontextmenu = (ev) => {
      ev.preventDefault();
      console.log('I right clicked');
    };
    imgElem.ondragstart = (ev) => ev.dataTransfer.setDragImage(ev.target, 10, 10);
    document.getElementsByTagName('BODY')[0].appendChild(imgElem);
    this.isSelectionActive = true;
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
