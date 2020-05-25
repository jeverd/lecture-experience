import Point from '/classes/point.js';

export function getMouseCoordsOnCanvas(e, canvas){
    let rect = canvas.getBoundingClientRect();
    let x = Math.round(e.clientX - rect.left);
    let y = Math.round(e.clientY - rect.top);
    return new Point(x, y); //(x:x, y:y) previously
}

// This will find the distance for the drawing of the circle in the canvas
export function findDistance(point1, point2){ //coord1 ==> start, coord2 ==> finish, 
    let exp1 = Math.pow(point2.x - point1.x, 2);
    let exp2 = Math.pow(point2.y - point1.y, 2);

    let distance = Math.sqrt(exp1 + exp2);

    return distance;
}