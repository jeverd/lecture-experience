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
