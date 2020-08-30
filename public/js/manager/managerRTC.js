import initializeStreamConfigurations from './streamConfigurations.js';
import {
  getJanusUrl, getTurnServers, getStunServers, displayMediaError,
  getJanusToken, getStatusColor, addNewSpeaker, addStream
} from '../utility.js';

let janus;
let isRtcEstablished = false;
let canvasStream;

const hasAudio = $('#audioValidator').val() === 'true';
const hasWebcam = $('#webcamValidator').val() === 'true';
const hasWhiteboard = $('#whiteboardValidator').val() === 'true';

function changeLectureStatus(status) {
  $('.status-dot').css('color', getStatusColor(status));
  $('.lecture-running-text').html($(`#status-${status}`).val());
}

export const changeStatus = {
  starting: () => changeLectureStatus('starting'),
  live: () => { changeLectureStatus('live'); isRtcEstablished = true; },
  connection_lost: () => { changeLectureStatus('connection_lost'); isRtcEstablished = false; },
};

export async function initializeManagerRTC(stream, initCanvasStream) {
  canvasStream = initCanvasStream;
  const turnServers = await getTurnServers();
  const janusToken = await getJanusToken();
  const stunServers = getStunServers();
  const roomId = $('#_id').val();
  const janusUrl = getJanusUrl();

  function joinFeed(publishers){
    publishers.forEach((publisher) => {
      //if display is defined it means it's a stream from manager and we don't want to subscribe
      if (typeof publisher.display === 'undefined') {
        let remoteHandle;
        janus.attach({
          plugin: 'janus.plugin.videoroom',
          success(remHandle) {
            remoteHandle = remHandle;
            remoteHandle.send({
              message: {
                request: 'join',
                ptype: 'subscriber',
                room: parseInt(roomId),
                feed: publisher.id,
              },
            });
          },
          onmessage(msg, offerJsep) {
            const event = msg.videoroom;
            if (event === 'attached') {
              remoteHandle.currentPublisherId = msg.id;
            }
            if (offerJsep) {
              remoteHandle.createAnswer({
                jsep: offerJsep,
                media: {
                  audioSend: false,
                  videoSend: false,
                },
                success(answerJsep) {
                  remoteHandle.send({
                    message: {
                      request: 'start',
                      room: roomId
                    },
                    jsep: answerJsep
                  });
                },
              });
            }
          },
          onremotestream(stream) {
            const audioTrack = stream.getAudioTracks()[0];
            addNewSpeaker(audioTrack, remoteHandle.currentPublisherId);
          }
        });
      }
    });
  }

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

        const status = feedMsg.videoroom;
        switch (status) {
          case 'joined':
            joinFeed(feedMsg.publishers);
            const feedRequest = {
              request: 'configure'
            };
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
            break;
          case 'event':
            if (typeof feedMsg.publishers !== 'undefined') {
              joinFeed(feedMsg.publishers);
            }
            break;
          default:
            break;
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
      },
      webrtcState(isConnected) {
        setTimeout(changeStatus[isConnected ? 'live' : 'connection_lost'], 700);
      },
    });
  }

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

function reconnectStream(stream) {
  if (typeof janus !== 'undefined') {
    janus.destroy();
  }
  changeStatus.starting();
  initializeManagerRTC(stream, canvasStream);
}

export function initializeManagerMedia(beginLectureCb) {
  function getUserMedia(successCb, devices = {}) {
    const mediaConstraints = {
      audio: typeof devices.audio !== 'undefined' ? { deviceId: { exact: devices.audio } } : hasAudio,
      video: typeof devices.video !== 'undefined' ? { deviceId: { exact: devices.video } } : hasWebcam,
    };
    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then((stream) => {
        successCb(stream);
      })
      .catch(displayMediaError);
  }

  function changeDevice(stream, device) {
    stream.getTracks().forEach((track) => {
      track.stop();
      stream.removeTrack(track);
    });
    getUserMedia((updatedStream) => {
      updatedStream.getTracks().forEach((updatedTrack) => {
        stream.addTrack(updatedTrack);
      });
      if (isRtcEstablished) {
        reconnectStream(stream);
      }
    }, device);
  }

  if (hasAudio || hasWebcam) {
    getUserMedia((stream) => {
      beginLectureCb(stream);
      initializeStreamConfigurations(stream, changeDevice);
    });
  } else {
    beginLectureCb();
  }

  $('#minimize-webcam-view').click(() => {
    $('#active-webcam-view').fadeOut(() => $('#inactive-webcam-view').fadeIn());
  });

  $('#inactive-webcam-view img').click(function () {
    $(this).parent().fadeOut(() => $('#active-webcam-view').fadeIn());
  });
}
