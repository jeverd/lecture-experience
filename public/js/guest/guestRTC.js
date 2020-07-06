/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
import { getJanusUrl, addStream } from '../utility.js';

export default function initializeGuestRTC(roomId) {
  const janusUrl = getJanusUrl();
  let janus;
  let handle;

  function joinFeed(publishers) {
    publishers.forEach((publisher) => {
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
          const webcam = document.getElementById('webcam');
          const speaker = document.getElementById('speaker');
          const videoTrack = stream.getVideoTracks()[0];
          if (stream.getTracks().length === 2) {
            if (webcam !== null) {
              addStream(webcam, videoTrack);
            } else {
              addStream(whiteboard, videoTrack);
            }
            const audioTrack = stream.getAudioTracks()[0];
            addStream(speaker, audioTrack);
          } else {
            addStream(whiteboard, videoTrack);
          }
        },
      });
    });
  }

  Janus.init({
    callback() {
      janus = new Janus(
        {
          debug: 'all',
          server: janusUrl,
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
}
