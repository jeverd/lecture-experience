/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
import {
  getJanusUrl, addStream, getTurnServers, getStunServers, getStatusColor, getImageFromVideo,
} from '../utility.js';

export const changeStatus = {
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

export default async function initializeGuestRTC(roomId) {
  const hasWebcam = $('#webcamValidator').val() === 'true';
  const hasWhiteboard = $('#whiteboardValidator').val() === 'true';
  const webcam = document.getElementById('webcam');
  const whiteboard = document.getElementById('whiteboard');
  const speaker = document.getElementById('speaker');
  const janusUrl = getJanusUrl();
  let isCameraSwapped = false;
  let janus;
  let handle;

  function joinFeed(publishers) {
    if (publishers.length === 0) {
      setTimeout(changeStatus.host_disconnected, 500);
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
            setTimeout(changeStatus.live, 500);
          },
        });
      });
    }
  }

  const turnServers = await getTurnServers();
  const stunServers = getStunServers();
  Janus.init({
    callback() {
      janus = new Janus(
        {
          debug: 'all',
          server: janusUrl,
          iceServers: [...turnServers, ...stunServers],
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
                      if (typeof msg.unpublished !== 'undefined' || typeof msg.leaving !== 'undefined') {
                        // Handle here properly when the manager disconnects
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
