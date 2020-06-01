/* eslint-disable no-param-reassign */
export const TOOL_SQUARE = 'square';
export const TOOL_TRIANGLE = 'triangle';
export const TOOL_PAINT_BUCKET = 'paint-bucket';
export const TOOL_PENCIL = 'pencil';
export const TOOL_ERASER = 'eraser';
export const TOOL_LINE = 'line';
export const TOOL_CIRCLE = 'circle';

export default function initializeToolsMenu(whiteboard) {
  document.querySelectorAll('.back-to-tool-menu').forEach(
    (backElem) => {
      backElem.addEventListener('click', () => {
        document.querySelectorAll('[data-main]').forEach(
          (item) => {
            const mainKey = item.getAttribute('data-main');
            const prefix = '#right-bar';
            document.querySelector(`${prefix}-${mainKey}`).style.display = 'none';
          },
        );
        document.querySelector('#right-bar-main').style.display = 'block';
      });
    },
  );

  document.querySelectorAll('[data-main]').forEach(
    (item) => {
      item.addEventListener('click', () => {
        const mainKey = item.getAttribute('data-main');
        const prefix = '#right-bar';
        document.querySelector(`${prefix}-main`).style.display = 'none';
        document.querySelector(`${prefix}-${mainKey}`).style.display = 'block';
      });
    },
  );
  document.querySelectorAll('[data-tool]').forEach(
    (item) => (
      item.addEventListener('click', () => {
        document.querySelector('[data-tool].active').classList.toggle('active'); // remove the previous active function from the active class

        item.classList.add('active'); // we add the element we clicked on to the active class

        // with the tool.class.js created:
        const selectedTool = item.getAttribute('data-tool');
        whiteboard.activeTool = selectedTool;
      })),
  );

  document.querySelectorAll('[data-line-width]').forEach(
    (item) => {
      item.addEventListener('click', () => {
        // document.querySelector('[data-line-width].active').classList.toggle('active'); // remove the previous active function from the active class
        // item.classList.add('active'); // we add the element we clicked on to the active class

        const lineWidth = item.getAttribute('data-line-width');
        whiteboard.lineWidth = lineWidth;
      });
    },
  );

  document.querySelectorAll('[data-color]').forEach(
    (item) => {
      item.addEventListener('click', () => {
        document.querySelector('[data-color].active').classList.toggle('active'); // remove the previous active function from the active class
        item.classList.add('active'); // we add the element we clicked on to the active class

        const color = item.getAttribute('data-color');

        whiteboard.selectedColor = color;
      });
    },
  );
}

window.addEventListener('keydown', e => {

  //paint.tool is the one that stores the current paint tool
   if (paint.tool == "select-area"){
       if (e.key === "Backspace" || e.key === "Delete"){
          var canvas = document.getElementById("canvas");
          var context = canvas.getContext("2d");
           
          var start = paint.startingPoint;
          var end = paint.endPoint;

          /* TAKE CARE OF ALL DIRECTIONS POSSIBLE FOR DRAG AND DROP ERASING FUNCIOTIONALITY*/
          //start high go down, right (good)
          if (start.x < end.x && start.y < end.y){
               context.clearRect(start.x - 2, start.y - 2, (end.x - start.x) + 3, (end.y - start.y) + 3);
          }else if (start.x < end.x && start.y > end.y){ //start low, go up, right (good)
               context.clearRect(start.x - 2, end.y - 2, (end.x - start.x) + 3, (start.y - end.y) + 3);
          }else if (start.x > end.x && start.y < end.y){ // start high, go down, left (good)
               context.clearRect(end.x - 2, start.y - 2, (start.x - end.x) + 3, (end.y - start.y) + 3);
          }else if (start.x > end.x && start.y > end.y){ //start low, go up, left (good)
               context.clearRect(end.x - 2, end.y - 2, (start.x - end.x) + 3, (start.y - end.y) + 3);
          }

          // if there is a select area square on the canvas, remove it from the undo stack
          if (paint.numSquares == true){
           paint.undoStack.pop(); // this makes it so returning to the deleted drawing requires the redo button
          }
          paint.numSquares = false;



   // if the user presses ctrl + c, copy the image inside of the dotted rectangle
       }else if (e.key === "c" && e.ctrlKey){
           var canvas = document.getElementById("canvas");
           var context = canvas.getContext("2d");
            
           var start = paint.startingPoint;
           var end = paint.endPoint;
           
           /* TAKE CARE OF ALL DIRECTIONS POSSIBLE FOR DRAG AND DROP COPYING FUNCIOTIONALITY*/
           
           if (start.x < end.x && start.y < end.y){//start high go down, right (good)
                let test = context.getImageData(start.x, start.y, (end.x - start.x), (end.y - start.y));
                //context.putImageData(test, start.x + 20, start.y + 20); (this works...... ish)
                paint.getRectImage(test);
           }else if (start.x < end.x && start.y > end.y){ //start low, go up, right (good)
                let test = context.getImageData(start.x, end.y, (end.x - start.x), (start.y - end.y));
                paint.getRectImage(test);
           }else if (start.x > end.x && start.y < end.y){ // start high, go down, left (good)
                let test = context.getImageData(end.x, start.y, (start.x - end.x), (end.y - start.y));
                paint.getRectImage(test);
           }else if (start.x > end.x && start.y > end.y){ //start low, go up, left (good)
                let test = context.getImageData(end.x, end.y, (start.x - end.x), (start.y - end.y));
                paint.getRectImage(test);
           }
       }
   }
});