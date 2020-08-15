import Point from './Point.js';

function colorsMatch(color1, color2) {
  return color1[0] === color2[0] && color1[1] === color2[1]
              && color1[2] === color2[2] && color1[3] === color2[3];
}

function hexToRgba(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [
    parseInt(result[1], 16), // convert hex value to a number
    parseInt(result[2], 16),
    parseInt(result[3], 16),
    255,
  ];
}

export default class Fill {
  // canvas ==> canvas board being affected
  // point ==> point at which the algorithm will start being executed
  // color ==> replacement color (the one that will fill the screen)

  constructor(canvas, point, color) {
    this.fillStack = [];
    this.context = canvas.getContext('2d');

    // image data will be the RGB value of all the pixels on the screen in an array
    this.imageData = this.context.getImageData(0, 0,
      this.context.canvas.width, this.context.canvas.height);

    const targetColor = this.getPixel(point);

    const fillColor = hexToRgba(color);

    this.floodFill(point, targetColor, fillColor); // maybe this.targetColor, this.fillColor
    this.fillColor();
  }

  // function that will fill the screen
  floodFill(point, targetColor, fillColor) {
    if (colorsMatch(targetColor, fillColor)) return;

    const currentColor = this.getPixel(point);

    // paint if colorsMatch(currentColor, targetColor) returns true
    if (colorsMatch(currentColor, targetColor)) {
      this.setPixel(point, fillColor);
      // color left, right, up, down pixels respectively
      this.fillStack.push([new Point(point.x + 1, point.y), targetColor, fillColor]);
      this.fillStack.push([new Point(point.x - 1, point.y), targetColor, fillColor]);
      this.fillStack.push([new Point(point.x, point.y + 1), targetColor, fillColor]);
      this.fillStack.push([new Point(point.x, point.y - 1), targetColor, fillColor]);
    }
  }

  fillColor() {
    if (this.fillStack.length !== 0) {
      const range = this.fillStack.length;

      for (let i = 0; i < range; i++) {
        this.floodFill(this.fillStack[i][0], this.fillStack[i][1], this.fillStack[i][2]);
      }

      this.fillStack.splice(0, range);

      this.fillColor();
    } else {
      // if it is succesfull, color the image and empty the stack
      this.context.putImageData(this.imageData, 0, 0);
      this.fillStack = [];
    }
  }

  getPixel(point) {
    // check to see if the pixel selected is not outside of the canvas
    if (point.x < 0 || point.y < 0
        || point.x >= this.imageData.width, point.y >= this.imageData.height) {
      return [-1, -1, -1, -1];
    }
    const offset = (point.y * this.imageData.width + point.x) * 4;

    // return the surrounding pixel values
    return [
      this.imageData.data[offset + 0], // red portion
      this.imageData.data[offset + 1], // green portion
      this.imageData.data[offset + 2], // blue portion
      this.imageData.data[offset + 3], // alpha portion

    ];
  }

  setPixel(point, fillColor) {
    const offset = (point.y * this.imageData.width + point.x) * 4;

    this.imageData.data[offset + 0] = fillColor[0]; // red portion
    this.imageData.data[offset + 1] = fillColor[1]; // green portion
    this.imageData.data[offset + 2] = fillColor[2]; // blue portion
    this.imageData.data[offset + 3] = fillColor[3]; // alpha portion
  }
}
