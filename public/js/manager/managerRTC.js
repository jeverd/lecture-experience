/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import {
  getJanusUrl, addStream, getTurnServers, getStunServers, getJanusToken,
} from '../utility.js';

export default async function initializeManagerRTC(roomId, stream, canvasStream) {
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
            request: 'join', ptype: 'publisher', room: roomId, display: label,
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
            if (typeof video.canvas === 'undefined') {
              addStream(webcam, video);
            }
          });
        }
      },
    });
  }

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

  $('#minimize-webcam-view').click(() => {
    $('#active-webcam-view').fadeOut(() => $('#inactive-webcam-view').fadeIn());
  });

  $('#inactive-webcam-view img').click(function () {
    $(this).parent().fadeOut(() => $('#active-webcam-view').fadeIn());
  });
}
