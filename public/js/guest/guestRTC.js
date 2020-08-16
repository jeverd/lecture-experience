import {
  getUrlId, getJanusUrl, addStream, getTurnServers,
  getStunServers, getStatusColor, getImageFromVideo, getJanusToken,
} from '../utility.js';

const hasWebcam = $('#webcamValidator').val() === 'true';
const hasWhiteboard = $('#whiteboardValidator').val() === 'true';
const webcam = document.getElementById('webcam');
const whiteboard = document.getElementById('whiteboard');
const speaker = document.getElementById('speaker');
const janusUrl = getJanusUrl();
let isCameraSwapped = false;
let janus;
let handle;

export const changeStatus = {
  starting: () => {
    $('#lecture-status .status-dot').css('background', getStatusColor('starting'));
    $('#lecture-status .status-text').html($('#status-starting').val());
    $('video#whiteboard').parent().addClass('running');
  },
  host_disconnected: () => {
    $('video#whiteboard').parent().addClass('running');
    $('video#whiteboard').attr('srcObject', null);
    $('#lecture-status .status-dot').css('background', getStatusColor('host_disconnected'));
    $('#lecture-status .status-text').html($('#status-host-disconnected').val());
  },
  live: () => {
    $('#lecture-status .status-dot').css('background', getStatusColor('live'));
    $('#lecture-status .status-text').html($('#status-live').val());
    $('video#whiteboard').parent().removeClass('running');
  },
  connection_lost: () => {
    $('video#whiteboard').parent().addClass('running');
    $('video#whiteboard').attr('srcObject', null);
    $('#lecture-status .status-dot').css('background', getStatusColor('connection_lost'));
    $('#lecture-status .status-text').html($('#status-connection-lost').val());
  },
};

async function initializeJanus() {
  const roomId = parseInt(getUrlId());
  function joinFeed(publishers) {
    changeStatus.starting();
    if (publishers.length === 0) {
      changeStatus.host_disconnected();
    } else {
      publishers.forEach((publisher) => {
        const streamType = publisher.display;
        let remoteHandle;
        janus.attach({
          plugin: 'janus.plugin.videoroom',
          success(remHandle) {
            remoteHandle = remHandle;
            remoteHandle.send({
              message: {
                request: 'join', ptype: 'subscriber', room: roomId, feed: publisher.id,
              },
            });
          },
          onmessage(msg, offerJsep) {
            const event = msg.videoroom;
            if (event === 'attached') {
              remoteHandle.rfid = msg.id;
              remoteHandle.rfdisplay = msg.display;
            }
            if (offerJsep) {
              remoteHandle.createAnswer({
                jsep: offerJsep,
                media: {
                  audioSend: false, videoSend: false,
                },
                success(answerJsep) {
                  remoteHandle.send({ message: { request: 'start', room: roomId }, jsep: answerJsep });
                },
              });
            }
          },
          onremotestream(stream) {
            const videoTrack = stream.getVideoTracks()[0];
            const audioTrack = stream.getAudioTracks()[0];
            addStream(speaker, audioTrack);
            if (streamType === 'stream') {
              if (!isCameraSwapped) {
                addStream(hasWhiteboard ? webcam : whiteboard, videoTrack);
              } else {
                addStream(hasWhiteboard ? whiteboard : webcam, videoTrack);
              }
            } else if (streamType === 'canvasStream') {
              if (hasWebcam) {
                addStream(!isCameraSwapped ? whiteboard : webcam, videoTrack);
              } else {
                addStream(whiteboard, videoTrack);
              }
            }
          },
          webrtcState(isConnected) { changeStatus[isConnected ? 'live' : 'connection_lost'](); },
          iceState(state) { if (state === 'connected') changeStatus.live(); },
        });
      });
    }
  }

  const turnServers = await getTurnServers();
  const janusToken = await getJanusToken();
  const stunServers = getStunServers();

  Janus.init({
    callback() {
      janus = new Janus(
        {
          debug: 'all',
          server: janusUrl,
          iceServers: [...turnServers, ...stunServers],
          token: janusToken,
          // iceTransportPolicy: 'relay',   enable to force turn server
          success() {
            janus.attach(
              {
                plugin: 'janus.plugin.videoroom',
                success(pluginHandle) {
                  handle = pluginHandle;
                  handle.send({
                    message: {
                      request: 'join', ptype: 'publisher', room: roomId,
                    },
                  });
                },
                onmessage(msg) {
                  const status = msg.videoroom;
                  switch (status) {
                    case 'joined':
                      joinFeed(msg.publishers);
                      break;
                    case 'event':
                      if (typeof msg.unpublished !== 'undefined') {
                        changeStatus.host_disconnected();
                      } else if (typeof msg.publishers !== 'undefined') {
                        joinFeed(msg.publishers);
                      }
                      break;
                    default: break;
                  }
                },
              },
            );
          },
        },
      );
    },
  });
}

export default function initializeGuestRTC() {
  initializeJanus();
  $('#expand-webcam-view').click(() => {
    const newPoster = getImageFromVideo(!isCameraSwapped ? whiteboard : webcam);
    const tmpStream = whiteboard.srcObject;
    whiteboard.srcObject = webcam.srcObject;
    webcam.srcObject = tmpStream;
    // picked 300 just to make sure its not an empty poster
    if (!isCameraSwapped) {
      webcam.poster = newPoster.length > 300 ? newPoster : whiteboard.poster;
    } else {
      whiteboard.poster = newPoster.length > 300 ? newPoster : webcam.poster;
    }
    isCameraSwapped = !isCameraSwapped;
  });

  $('#minimize-webcam-view').click(() => {
    $('.options-webcam').fadeOut();
    $('#webcam').fadeOut(() => $('#open-webcam-view').fadeIn());
  });

  $('#open-webcam-view').click(function () {
    $(this).fadeOut(() => {
      $('#webcam').fadeIn();
      $('.options-webcam').fadeIn();
    });
  });
}
