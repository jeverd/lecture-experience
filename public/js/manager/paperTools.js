/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable vars-on-top */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-new */
/* eslint-disable func-names */
/* eslint-disable object-shorthand */
/* eslint-disable no-var */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
var path;
var items = new Group();
var imageLayer = new Layer();
var drawsLayer = new Layer();
var selectedItem;
var onDragItem;
drawsLayer.addChild(items);
drawsLayer.activate();
imageLayer.insertBelow(drawsLayer);


var erase = function (event) {
  var hitResult = drawsLayer.hitTest(event.point);
  if (hitResult) {
    hitResult.item.opacity = 0.625;
    eraserTimeout = setTimeout(function () {
      if (hitResult) {
        hitResult.item.remove();
        hitResult = null;
      }
    }, 150);
  }
};

var clone = function () {
  if (Key.isDown('c') && Key.isDown('control')) {
    console.log('clonou');
  }
};

var desItem = function () {
  console.log('select');
  selectedItem.item.fullySelected = false;
  selectedItem = '';
};

var selectItem = function (event) {
  var hitResult = drawsLayer.hitTest(event.point);
  if (hitResult) {
    selectedItem = hitResult;
    onDragItem = hitResult;
    selectedItem.item.fullySelected = true;
  }
  if (!hitResult) {
    selectedItem.item.fullySelected = false;
    selectedItem = '';
  }
};

var drag = function (event) {
  onDragItem.item.position = event.point;
};

var deselectItem = function (event) {
  onDragItem = '';
};

var Zoom = function (scale, positionX, positionY) {
  var mouseCoord = new Point(positionX, positionY);
  view.zoom += 0.1;
  // view.zoom += scale;
};

var setPathProperties = function () {
  path.fillColor = 'transparent';
  path.strokeColor = activeColor;
  path.strokeWidth = activeWidth;
  path.parent = items;
};


window.app = {
  tools: {
    pencil: new Tool({
      onMouseDown: function (event) {
        path = new Path({
          index: 1000,
          segments: [event.point],
          strokeCap: 'round',
          sendToBack: false,
        });
        setPathProperties();
        drawsLayer.addChild(path);
      },
      onMouseDrag: function (event) {
        path.add(event.point);
        drawsLayer.addChild(path);
      },
      onMouseUp: function (event) {
        path.simplify(10);
        drawsLayer.addChild(path);
      },
    }),
    pointer: new Tool({
      onMouseDown: selectItem,
      onMouseDrag: drag,
      onMouseUp: deselectItem,
    }),
    eraser: new Tool({
      onMouseDown: erase,
      onMouseDrag: erase,
    }),
    circle: new Tool({
      onMouseDrag: function (event) {
        path = new Path.Circle({
          center: event.downPoint,
          radius: (event.downPoint - event.point).length,
        });
        setPathProperties();
        drawsLayer.addChild(path);
        path.removeOnDrag();
      },
    }),
    square: new Tool({
      onMouseDrag: function (event) {
        var rectangle = new Rectangle(event.downPoint, event.lastPoint);
        path = new Path.Rectangle(rectangle);
        setPathProperties();
        drawsLayer.addChild(path);
        path.removeOnDrag();
      },
    }),
    line: new Tool({
      onMouseDrag: function (event) {
        path = new Path.Line(event.downPoint, event.lastPoint);
        setPathProperties();
        drawsLayer.addChild(path);
        path.removeOnDrag();
      },
    }),
    triangle: new Tool({
      onMouseDrag: function (event) {
        path = new Path.RegularPolygon(event.downPoint, 3, (event.lastPoint - event.downPoint).y);
        setPathProperties();
        drawsLayer.addChild(path);
        path.removeOnDrag();
      },
    }),
  },
  paintBackgroundWhite: function () {
    var rect = new Path.Rectangle({
      point: [0, 0],
      size: [view.size.width, view.size.height],
      strokeColor: 'white',
    });
    rect.fillColor = 'white';
    rect.sendToBack();
    imageLayer.addChild(rect);
  },
  paintCircle: function () {
    var circle = new Path.Rectangle(new Point(0, 0), view.size.width, view.size.height);

    project.activeLayer.lastChild.fillColor = 'white';

    drawsLayer.removeChildren();
  },
  setBackground: function (src) {
    var raster = new Raster({
      source: src,
      position: view.center,
    });
  },
  putImage: function (src, x, y) {
    new Raster({
      source: src,
      position: new Point(x, y),
      parent: items,
    });
  },
  zoom: function (scale, x, y) {
    Zoom(scale, x, y);
  },
  getElem: function () {
    return drawsLayer.children;
  },
  addDraws: function (array) {
    this.paintCircle();
    for (var i in array) {
      var loadedPath = new Path({
        pathData: array[i],
      });
      loadedPath.strokeColor = activeColor;
      loadedPath.strokeWidth = activeWidth;
      loadedPath.parent = items;

      drawsLayer.addChild(loadedPath);
    }
  },
  saveSVG: function () {
    return project.exportSVG();
  },
  deselect: function () {
    console.log('aaa');
    desItem();
  },
  clone: function () {
    if (selectedItem) {
      console.log('clone');
      var clone = selectedItem.clone();
      clone.item.position = selectedItem.item.position + (100, 0);
      drawsLayer.addChild(clone);
    }
  },
};
