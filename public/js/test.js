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

var erase = function (event) {
  var hitResult = items.hitTest(event.point);
  if (hitResult) {
    hitResult.item.opacity = 0.625;
    eraserTimeout = setTimeout(function () {
      if (hitResult) {
        hitResult.item.remove();
        hitResult = null;
      }
    }, 250);
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
<<<<<<< HEAD
=======
        console.log(project.layers);
>>>>>>> 13bc28d51aa870890f1b7ab49f46424cfb135338
        path = new Path({
          segments: [event.point],
          strokeCap: 'round',
        });
        setPathProperties();
      },
      onMouseDrag: function (event) { path.add(event.point); },
      onMouseUp: function (event) { path.simplify(10); },
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
        path.removeOnDrag();
      },
    }),
    rectangle: new Tool({
      onMouseDrag: function (event) {
        var rectangle = new Rectangle(event.downPoint, event.lastPoint);
        path = new Path.Rectangle(rectangle);
        setPathProperties();
        path.removeOnDrag();
      },
    }),
    line: new Tool({
      onMouseDrag: function (event) {
        path = new Path.Line(event.downPoint, event.lastPoint);
        setPathProperties();
        path.removeOnDrag();
      },
    }),
    triangle: new Tool({
      onMouseDrag: function (event) {
        path = new Path.RegularPolygon(event.downPoint, 3, (event.lastPoint - event.downPoint).y);
        setPathProperties();
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
};
