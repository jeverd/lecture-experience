/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import initializeStreamConfigurations from './streamConfigurations.js';

import {
  getJanusUrl, addStream, getTurnServers, getStunServers,
  getJanusToken, getStatusColor, reloadWindow,
} from '../utility.js';

function changeLectureStatus(status) {
  $('.status-dot').css('color', getStatusColor(status));
  $('.lecture-running-text').html($(`#status-${status}`).val());
}

export const changeStatus = {
  starting: () => changeLectureStatus('starting'),
  live: () => changeLectureStatus('live'),
  connection_lost: () => changeLectureStatus('connection_lost'),
};

export default function initializeManagerRTC(roomId, canvasStream, beginLectureCb) {
  const hasAudio = $('#audioValidator').val() === 'true';
  const hasWebcam = $('#webcamValidator').val() === 'true';
  const hasWhiteboard = $('#whiteboardValidator').val() === 'true';
  const janusUrl = getJanusUrl();
  let janus;

  function publishFeed(feedStream, label) {
    let feedHandle;
    janus.attach({
      plugin: 'janus.plugin.videoroom',
      success(handle) {
        feedHandle = handle;
        feedHandle.send({
          message: {
            request: 'join', ptype: 'publisher', room: parseInt(roomId), display: label,
          },
        });
      },
      onmessage(feedMsg, feedJsep) {
        if (feedJsep && feedJsep.type === 'answer') {
          feedHandle.handleRemoteJsep({ jsep: feedJsep });
        }
        if (feedMsg.videoroom === 'joined') {
          const feedRequest = { request: 'configure' };
          feedRequest.video = feedStream.getVideoTracks().length > 0;
          feedRequest.audio = feedStream.getAudioTracks().length > 0;
          feedHandle.createOffer({
            stream: feedStream,
            success(offerJsep) {
              feedHandle.send({
                message: feedRequest,
                jsep: offerJsep,
              });
            },
          });
        }
      },
      onlocalstream(localStream) {
        if (hasWebcam) {
          const webcam = document.getElementById('webcam');
          const videoTracks = localStream.getTracks().filter((track) => track.kind === 'video');
          videoTracks.forEach((video) => {
            if (typeof video.canvas === 'undefined' && video.label !== '') {
              addStream(webcam, video);
            }
          });
        }
        setTimeout(changeStatus.live, 1000);
      },
    });
  }

  async function initializeJanus(stream) {
    const turnServers = await getTurnServers();
    const janusToken = await getJanusToken();
    const stunServers = getStunServers();

    Janus.init({
      debug: 'all',
      callback() {
        janus = new Janus({
          server: janusUrl,
          iceServers: [...turnServers, ...stunServers],
          token: janusToken,
          // iceTransportPolicy: 'relay',   enable to force turn server
          success() {
            if (hasWhiteboard && hasWebcam) {
              publishFeed(stream, 'stream');
              publishFeed(canvasStream, 'canvasStream');
            } else if (hasWhiteboard && hasAudio) {
              stream.addTrack(canvasStream.getTracks()[0]);
              publishFeed(stream, 'canvasStream');
            } else if (!hasWhiteboard) {
              publishFeed(stream, 'stream');
            } else {
              publishFeed(canvasStream, 'canvasStream');
            }
          },
        });
      },
    });
  }

  function getUserMedia(successCb, devices = {}) {
    const mediaConstraints = {
      audio: typeof devices.audio !== 'undefined' ? { deviceId: { exact: devices.audio } } : hasAudio,
      video: typeof devices.video !== 'undefined' ? { deviceId: { exact: devices.video } } : hasWebcam,
    };
    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((stream) => {
        successCb(stream);
      })
      .catch((error) => {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: `<strong style="font-size: 1.2rem">${$('#swal-title').val()}</strong>`,
          html: `<div style="font-size: .9rem; opacity: .85;">
              ${$('#swal-text').val()}
            </div>`,
          confirmButtonColor: 'rgba(70, 194, 255, 1)',
          confirmButtonText: 'Ok',
          showClass: {
            popup: 'animate__animated animate__fadeIn',
          },
          footer: `
              <a style="color: gray; text-decoration: none;" href="https://getacclaim.zendesk.com/hc/en-us/articles/360001547832-Setting-the-default-camera-on-your-browser">
                <i class="fa fa-question-circle" aria-hidden="true"></i> ${$('#swal-help').val()}
              </a>`,
        }).then(reloadWindow);
      });
  }

  function changeDevice(stream, device) {
    if (typeof janus !== 'undefined') {
      janus.destroy();
    }
    stream.getTracks().forEach((track) => {
      track.stop();
      stream.removeTrack(track);
    });
    getUserMedia((updatedStream) => {
      updatedStream.getTracks().forEach((updatedTrack) => {
        stream.addTrack(updatedTrack);
      });
      changeStatus.starting();
      initializeJanus(updatedStream);
    }, device);
  }

  if (hasAudio || hasWebcam) {
    getUserMedia((stream) => {
      beginLectureCb();
      initializeStreamConfigurations(stream, changeDevice);
      initializeJanus(stream);
    });
  } else {
    beginLectureCb();
    initializeJanus();
  }

  $('#minimize-webcam-view').click(() => {
    $('#active-webcam-view').fadeOut(() => $('#inactive-webcam-view').fadeIn());
  });

  $('#inactive-webcam-view img').click(function () {
    $(this).parent().fadeOut(() => $('#active-webcam-view').fadeIn());
  });
}
