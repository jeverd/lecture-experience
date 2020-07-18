/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-properties */
/* eslint-disable import/extensions */
/* eslint-disable import/no-absolute-path */
/* eslint-disable-next-line import/no-unresolved */
import Point from './classes/point.js';

export function getMouseCoordsOnCanvas(e, canvas) {
  let x; let y;
  // handle tablet/phone
  if (e.touches) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }
  const rect = canvas.getBoundingClientRect();
  x = Math.round(x - rect.left);
  y = Math.round(y - rect.top);
  return new Point(x, y);
}

// This will find the distance for the drawing of the circle in the canvas
export function findDistance(point1, point2) { // coord1 ==> start, coord2 ==> finish,
  const exp1 = Math.pow(point2.x - point1.x, 2);
  const exp2 = Math.pow(point2.y - point1.y, 2);

  const distance = Math.sqrt(exp1 + exp2);

  return distance;
}

export function getImgElemFromImgData(imgData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  ctx.putImageData(imgData, 0, 0);
  const imgElem = document.createElement('img');
  imgElem.src = canvas.toDataURL();
  return imgElem;
}

export function getImgDataFromImgElem(imgElem) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = imgElem.width;
  canvas.height = imgElem.height;
  context.drawImage(imgElem, 0, 0);
  return context.getImageData(0, 0, imgElem.width, imgElem.height);
}

export function showInfoMessage(message) {
  const popupId = '#info-popup';
  $(popupId).html(message);
  // do not change to arrow function! Or else it loses "this" context.
  $(popupId).fadeIn(200, function () {
    setTimeout(() => {
      $(this).fadeOut(300);
    }, 2000);
  });
}

export function getUrlId() {
  const url = window.location.pathname;
  const lastSlash = url.lastIndexOf('/');
  return url.substr(lastSlash + 1);
}

export function getJanusUrl() {
  let { host } = window.location;
  let prefix = 'https';
  if (host.includes('localhost')) {
    prefix = 'http';
    const collonIndex = host.indexOf(':');
    host = `${host.slice(0, collonIndex + 1)}8088`;
  }
  return `${prefix}://${host}/janus`;
}

export function buildPostRequestOpts(body) {
  return {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  };
}

export function redirectToStats(roomId) {
  window.location = `/lecture/stats/${roomId}`;
}

export function isIOS() {
  return navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
}

export function copyTextToClipboard(text) {
  const tmpInput = document.createElement('input');
  tmpInput.value = text;
  document.body.appendChild(tmpInput);
  tmpInput.select();
  const range = document.createRange();
  range.selectNodeContents(tmpInput);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  tmpInput.setSelectionRange(0, 999999);
  document.execCommand('copy');
  document.body.removeChild(tmpInput);
}

export function reloadWindow() {
  window.location.reload();
}

export function addStream(htmlElem, streamTrack) {
  if (typeof streamTrack !== 'undefined') {
    const stream = new MediaStream();
    stream.addTrack(streamTrack);
    htmlElem.srcObject = stream;
    if ('srcObject' in htmlElem) {
      htmlElem.srcObject = stream;
    } else {
      htmlElem.src = window.URL.createObjURL(stream);
    }
  }
}

export async function getTurnCreds() {
  const response = await fetch('/turncreds');
  let turnServerConfig = [{ urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { url: 'stun:stun01.sipphone.com' },
    { url: 'stun:stun.ekiga.net' },
    { url: 'stun:stunserver.org' },
    { url: 'stun:stun.softjoys.com' },
    { url: 'stun:stun.voiparound.com' },
    { url: 'stun:stun.voipbuster.com' },
    { url: 'stun:stun.voipstunt.com' },
    { url: 'stun:stun.voxgratia.org' },
    { url: 'stun:stun.xten.com' }];
  if (response.status === 200) {
    const {
      active, username, password, uri,
    } = await response.json();


    if (active) {
      turnServerConfig = [...turnServerConfig, { username, credential: password, urls: uri }];
    }
  }
  return turnServerConfig;
}
