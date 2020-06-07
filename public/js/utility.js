/* eslint-disable no-restricted-properties */
/* eslint-disable import/extensions */
/* eslint-disable import/no-absolute-path */
/* eslint-disable-next-line import/no-unresolved */
import Point from '/classes/point.js';

export function getMouseCoordsOnCanvas(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  return new Point(x, y); // (x:x, y:y) previously
}

// This will find the distance for the drawing of the circle in the canvas
export function findDistance(point1, point2) { // coord1 ==> start, coord2 ==> finish,
  const exp1 = Math.pow(point2.x - point1.x, 2);
  const exp2 = Math.pow(point2.y - point1.y, 2);

  const distance = Math.sqrt(exp1 + exp2);

  return distance;
}
