/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import { getJanusUrl, addStream, getTurnCreds } from '../utility.js';

export default async function initializeManagerRTC(roomId, stream, canvasStream) {
  const janusUrl = getJanusUrl();
  let janus;

  function publishFeed(feedStream) {
    let feedHandle;
    janus.attach({
      plugin: 'janus.plugin.videoroom',
      success(handle) {
        feedHandle = handle;
        feedHandle.send({
          message: {
            request: 'join', ptype: 'publisher', room: roomId,
          },
        });
      },
      onmessage(feedMsg, feedJsep) {
        if (feedJsep && feedJsep.type === 'answer') {
          feedHandle.handleRemoteJsep({ jsep: feedJsep });
        }
        if (feedMsg.videoroom === 'joined') {
          const feedRequest = { request: 'configure', display: '' };
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
        const videoTracks = localStream.getTracks().filter((track) => track.kind === 'video');
        videoTracks.forEach((video) => {
          if (typeof video.canvas === 'undefined') {
            const webcamOutput = document.querySelector('#webcam');
            addStream(webcamOutput, video);
          }
        });
      },
    });
  }

  const turnServerConfig = await getTurnCreds();
  Janus.init({
    debug: 'all',
    callback() {
      janus = new Janus({
        server: janusUrl,
        iceServers: turnServerConfig,
        // iceTransportPolicy: 'relay',   enable to force turn server
        success() {
          if (stream.getVideoTracks().length === 0) {
            stream.addTrack(canvasStream.getTracks()[0]);
            publishFeed(stream);
          } else {
            publishFeed(stream);
            if (stream !== canvasStream) {
              publishFeed(canvasStream);
            }
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
