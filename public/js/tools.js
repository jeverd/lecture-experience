/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
export const TOOL_SQUARE = 'square';
export const TOOL_TRIANGLE = 'triangle';
export const TOOL_PAINT_BUCKET = 'paint-bucket';
export const TOOL_PENCIL = 'pencil';
export const TOOL_ERASER = 'eraser';
export const TOOL_LINE = 'line';
export const TOOL_CIRCLE = 'circle';
export const TOOL_SELECTAREA = 'select-area';

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
        whiteboard.removeSelectedRegion();
        $('[data-tool]').find('.tool-active-svg').removeClass('tool-active-svg');
        $('[data-tool]').find('.tool-active').removeClass('tool-active');

        $(item).find('.left-bar-link-svg').addClass('tool-active-svg');
        $(item).find('.left-bar-link').addClass('tool-active');

        whiteboard.activeTool = item.getAttribute('data-tool');
      })),
  );

  document.querySelectorAll('[data-line-width]').forEach(
    (item) => {
      item.addEventListener('click', () => {
        $('[data-line-width]').find('.tool-active').removeClass('tool-active');
        $(item).find('.left-bar-link').addClass('tool-active');

        const lineWidth = item.getAttribute('data-line-width');
        whiteboard.lineWidth = lineWidth;
      });
    },
  );

  document.querySelectorAll('[data-color]').forEach(
    (item) => {
      item.addEventListener('click', () => {
        $('[data-color]').find('.tool-active').removeClass('tool-active');
        $(item).find('.right-bar-link').addClass('tool-active');
        whiteboard.selectedColor = item.getAttribute('data-color');
      });
    },
  );

  window.addEventListener('keydown', (e) => {
    // paint.tool is the one that stores the current paint tool
    if (whiteboard.tool === 'select-area') {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const start = whiteboard.startingPoint;
        const end = whiteboard.endPoint;

        /* TAKE CARE OF ALL DIRECTIONS POSSIBLE FOR DRAG AND DROP ERASING FUNCIOTIONALITY */
        // start high go down, right (good)
        whiteboard.context.fillStyle = 'white';
        if (start.x < end.x && start.y < end.y) {
          whiteboard.context.fillRect(start.x - 2, start.y - 2,
            (end.x - start.x) + 3, (end.y - start.y) + 3);
        } else if (start.x < end.x && start.y > end.y) { // start low, go up, right (good)
          whiteboard.context.fillRect(start.x - 2, end.y - 2,
            (end.x - start.x) + 3, (start.y - end.y) + 3);
        } else if (start.x > end.x && start.y < end.y) { // start high, go down, left (good)
          whiteboard.context.fillRect(end.x - 2, start.y - 2,
            (start.x - end.x) + 3, (end.y - start.y) + 3);
        } else if (start.x > end.x && start.y > end.y) { // start low, go up, left (good)
          whiteboard.context.fillRect(end.x - 2, end.y - 2,
            (start.x - end.x) + 3, (start.y - end.y) + 3);
        }
        whiteboard.removeSelectedRegion();

        // if the user presses ctrl + c, copy the image inside of the dotted rectangle
      } else if (e.key === 'c' && e.ctrlKey) {
        const start = whiteboard.startingPoint;
        const end = whiteboard.endPoint;

        /* TAKE CARE OF ALL DIRECTIONS POSSIBLE FOR DRAG AND DROP COPYING FUNCIOTIONALITY */
        let imgData;
        if (start.x < end.x && start.y < end.y) { // start high go down, right (good)
          imgData = whiteboard.context.getImageData(start.x + 1, start.y + 1,
            (end.x - start.x) - 2, (end.y - start.y) - 2);
          // context.putImageData(test, start.x + 20, start.y + 20); (this works...... ish)
        } else if (start.x < end.x && start.y > end.y) { // start low, go up, right (good)
          imgData = whiteboard.context.getImageData(start.x + 1, end.y + 1,
            (end.x - start.x) - 2, (start.y - end.y) - 2);
        } else if (start.x > end.x && start.y < end.y) { // start high, go down, left (good)
          imgData = whiteboard.context.getImageData(end.x + 1, start.y + 1,
            (start.x - end.x) - 2, (end.y - start.y) - 2);
        } else if (start.x > end.x && start.y > end.y) { // start low, go up, left (good)
          imgData = whiteboard.context.getImageData(end.x + 1, end.y + 1,
            (start.x - end.x) - 2, (start.y - end.y) - 2);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imgData.width;
        canvas.height = imgData.height;
        ctx.putImageData(imgData, 0, 0);
        const imgElem = document.createElement('img');
        imgElem.src = canvas.toDataURL();
        imgElem.style.position = 'absolute';
        imgElem.style.top = 200;
        imgElem.style.left = '50%';
        imgElem.style.zIndex = 10;
        imgElem.draggable = true;
        imgElem.ondragstart = (ev) => {
          ev.dataTransfer.setDragImage(ev.target, 10, 10);
          ev.dataTransfer.dropEffect = 'move';
        };
        document.querySelector('#test-img').appendChild(imgElem);
      }
    }
  });
}
