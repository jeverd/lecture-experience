var path;

function onMouseDown(event) {
  // If we produced a path before, deselect it:
  if (path) {
    path.selected = false;
  }

  // Create a new path and set its stroke color to black:
  path = new Path({
    segments: [event.point],
    strokeColor: 'black',
    strokeCap: 'round',
    strokeWidth: 15,
  });
}

// While the user drags the mouse, points are added to the path
// at the position of the mouse:
function onMouseDrag(event) {
  path.add(event.point);
}

// When the mouse is released, we simplify the path:
function onMouseUp(event) {
  // When the mouse is released, simplify it:
  path.simplify(10);
}