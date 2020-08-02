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
var selectedItem = '';
var boardZoomData = [];
var onDragItem;
var centerPoint;
var lastMousePoint = 0;
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
    }, 100);
  }
};

var desItem = function () {
  selectedItem.fullySelected = false;
  selectedItem = '';
};

var onChangeTool = function () {
  if (selectedItem) {
    selectedItem.fullySelected = false;
    selectedItem = '';
  }
};

var cloneItem = function () {
  if (selectedItem) {
    var clone = selectedItem.clone();

    clone.position = selectedItem.position + (100, 100);
    clone.fullySelected = false;
    drawsLayer.addChild(clone);
  }
};

var paint = function (event) {
  for (var i in drawsLayer.children) {
    var currentPath = drawsLayer.children[i];
    if (currentPath.contains(event.point)) {
      currentPath.fillColor = activeColor;
    }
  }
};

var selectItem = function (event) {
  var hitResult = drawsLayer.hitTest(event.point);
  /* COMEBACK TO THIS LATER
  for (var i in drawsLayer.children) {
    var currentPath = drawsLayer.children[i];
    if (currentPath.contains(event.point)) {
      selectedItem = currentPath;
      onDragItem = currentPath;
      currentPath.fullySelected = true;
    }
  }
  */
  if (hitResult) {
    if (selectedItem) {
      selectedItem.fullySelected = false;
    }
    selectedItem = hitResult.item;
    onDragItem = hitResult.item;
    selectedItem.fullySelected = true;
  }
  if (!hitResult) {
    if (selectedItem) {
      selectedItem.fullySelected = false;
      selectedItem = '';
    }
    centerPoint = {
      currentX: view.center.x,
      currentY: view.center.y
    }
  }
};

var drag = function (event) {
  if (onDragItem) {
    onDragItem.position = event.point;
  } else {
    var lastMousePoint = event.downPoint
    lastViewCenter = view.center;
    view.center = view.center.add(
      lastMousePoint.subtract(event.point)
    );
    lastMousePoint = event.point.add(view.center.subtract(lastViewCenter));
  }
};

var deselectItem = function (event) {
  onDragItem = '';
};

var Zoom = function (scale, positionX, positionY, zoomDirection) {
  var mousePosition = new Point(positionX, positionY);
  var newZoom = 0;
  var zoomFactor = 1.05;
  if (scale < 0) {
    newZoom = view.zoom * zoomFactor;
  }
  if (scale > 0) {
    newZoom = view.zoom / zoomFactor;
  }
  var beta = view.zoom / newZoom;
  var pc = mousePosition.subtract(view.center);
  var changeVector = mousePosition.subtract(pc.multiply(beta)).subtract(view.center);
  // console.log(changeVector)
  // view.center = view.center.add(changeVector);
  // console.log(view.center.x, view.center.y)
  view.zoom += zoomDirection;
  // move the center for the same amount comparing the position of the mouse with it
  // var zoomAmount = zoomDirection;
  // var centerAmount = 1000;
  // var verticalBorder = 300;
  // var horizontalBorder = 300;
  // var verticalCond = (positionY < view.center.y + horizontalBorder && positionY > view.center.y - horizontalBorder);
  // var horizontalCond = (positionX > view.center.x - verticalBorder && positionX < view.center.x + verticalBorder);

  // if (zoomDirection < 0) {
  //   //COMEBACK TO THIS LATER
  //   /*
  //   if (positionY < view.center.y && positionX < view.center.x + verticalBorder && positionX > view.center.x - verticalBorder) {
  //     // mid up
  //     view.center.y -= centerAmount;
  //     view.zoom += zoomAmount;
  //   }else if (positionY < view.center.y && positionX > view.center.x){
  //     // up right
  //     view.center.y -= centerAmount / 2;
  //     view.center.x += centerAmount;
  //     view.zoom += zoomAmount;
  //   }else if (positionY < view.center.y && positionX < view.center.x){
  //     // up left
  //     view.center.y -= centerAmount / 2;
  //     view.center.x -= centerAmount;
  //     view.zoom += zoomAmount;
  //   }else if (positionY > view.center.y && positionX > view.center.x - verticalBorder && positionX < view.center.x + verticalBorder){
  //     // mid down
  //     view.center.y += centerAmount;
  //     view.zoom += zoomAmount;
  //   }else if (positionY > view.center.y && positionX > view.center.x){
  //     // down right
  //     view.center.y += centerAmount / 2;
  //     view.center.x += centerAmount;
  //     view.zoom += zoomAmount;
  //   }else if (positionY > view.center.y && positionX < view.center.x){
  //     // down left
  //     view.center.y += centerAmount / 2;
  //     view.center.x -= centerAmount;
  //     view.zoom += zoomAmount;
  //   }else if (positionY < view.center.y + horizontalBorder && positionY > view.center.y - horizontalBorder && positionX > view.center.x + verticalBorder){
  //     view.center.x += centerAmount / 2;
  //     view.center.y += centerAmount / 2;
  //     view.zoom += zoomAmount;
  //   }else if (positionY < view.center.y + horizontalBorder && positionY > view.center.y - horizontalBorder && positionX < view.center.x + verticalBorder){
  //     view.center.x -= centerAmount;
  //     view.center.y += centerAmount / 2;
  //     view.zoom += zoomAmount;
  //   }else if (verticalCond && horizontalCond){
  //     view.zoom += zoomAmount;
  //   }else {
  //     view.zoom += zoomAmount;
  //   }
  // }else {
  //   view.zoom += zoomAmount;
  // }
  // */  
  //   if (view.zoom + zoomAmount < 0.2) {
  //     view.zoom = 0.2;
  //   } else {
  //     view.zoom += zoomAmount;
  //   }
  // } else {
  //   if (view.zoom + zoomAmount < 0.2) {
  //     view.zoom = 0.2;
  //   } else {
  //     view.zoom += zoomAmount;
  //   }
  // }
};

var delItem = function () {
  if (selectedItem) {
    selectedItem.remove();
  }
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
    bucket: new Tool({
      onMouseDown: paint,
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
      size: [10000, 10000],
      strokeColor: 'white',
    });
    rect.fillColor = 'white';
    rect.sendToBack();
    imageLayer.addChild(rect);
    view.center = view.center.add(
      view.center.subtract({x: -3000, y: -3000})
    );
  },
  updateCanvasFrame: function () {
    return setInterval(function() {
      var text = new PointText(new Point(200, 50));
      text.justification = 'center';
      text.content = '';
    }, 500);
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
    Zoom(scale, x, y, this.zoomDirection(scale));
  },
  getZoomData: function () {
    // ########
    return {
      zoom: view.zoom,
      centerX: view.center.x,
      centerY: view.center.y
    }
  },
  changeZoomCenter: function(delta, mousePosition) {
    if (!delta) {
      return;
    }

    const oldZoom = view.zoom;
    const oldCenter = view.center;
    const viewPos = view.viewToProject(mousePosition);

    let newZoom = delta > 0
    ? view.zoom * this.factor
    : view.zoom / this.factor
    newZoom = this.setZoomConstrained(newZoom);

    if (!newZoom) {
      return;
    }

    const zoomScale = oldZoom / newZoom;
    const centerAdjust = viewPos.subtract(oldCenter);
    const offset = viewPos.subtract(centerAdjust.multiply(zoomScale))
            .subtract(oldCenter);
    view.center = view.center.add(offset);
  },
  zoomDirection: function (scale) {
    if (scale < 0) {
      // inward movement
      return 0.03;
    } else {
      // outward movement
      return -0.03;
    }
  },
  getElem: function () {
    return drawsLayer.children;
  },
  addDraws: function (array) {
    this.paintCircle();
    for (var i in array) {
      var loadedPath = new Path({
        pathData: array[i][0],
      });
      loadedPath.strokeColor = array[i][1];
      loadedPath.strokeWidth = array[i][2];
      loadedPath.fillColor = array[i][3];
      loadedPath.parent = items;

      drawsLayer.addChild(loadedPath);
    }
  },
  saveSVG: function () {
    return project.exportSVG();
  },
  deselect: function () {
    desItem();
  },
  deselectOnToolChange: function () {
    onChangeTool();
  },
  copyItem: function () {
    cloneItem();
  },
  deleteItem: function () {
    delItem();
  },
};
