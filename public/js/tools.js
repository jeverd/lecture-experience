/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
export const TOOL_SQUARE = 'square';
export const TOOL_TRIANGLE = 'triangle';
export const TOOL_PAINT_BUCKET = 'pointer';
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
        $('[data-tool]').find('.tool-active-svg').removeClass('tool-active-svg');
        $('[data-tool]').find('.tool-active').removeClass('tool-active');

        $(item).find('.left-bar-link-svg').addClass('tool-active-svg');
        $(item).find('.left-bar-link').addClass('tool-active');
        const clickedTool = item.getAttribute('data-tool');
        whiteboard.tools.switchTo(clickedTool);
      })),
  );

  document.querySelectorAll('[data-line-width]').forEach(
    (item) => {
      item.addEventListener('click', () => {
        $('[data-line-width]').find('.tool-active').removeClass('tool-active');
        $(item).find('.left-bar-link').addClass('tool-active');

        const selectedWidth = item.getAttribute('data-line-width');
        activeWidth = selectedWidth;
      });
    },
  );

  document.querySelectorAll('[data-color]').forEach(
    (item) => {
      item.addEventListener('click', () => {
        $('[data-color]').find('.tool-active').removeClass('tool-active');
        $(item).find('.right-bar-link').addClass('tool-active');
        const selectedColor = item.getAttribute('data-color');
        activeColor = selectedColor;
      });
    },
  );
}
