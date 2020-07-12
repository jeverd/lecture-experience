/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
import { getJanusUrl } from '../utility.js';

export default async function initializeGuestRTC(roomId) {
  const janusUrl = getJanusUrl();
  let janus;
  let handle;

  function addStream(htmlElem, streamTrack) {
    const stream = new MediaStream();
    stream.addTrack(streamTrack);
    htmlElem.srcObject = stream;
    if ('srcObject' in htmlElem) {
      htmlElem.srcObject = stream;
    } else {
      htmlElem.src = window.URL.createObjURL(stream);
    }
  }

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
          const audioTrack = stream.getAudioTracks()[0];
          const speaker = document.getElementById('speaker');
          addStream(speaker, audioTrack);
          const whiteboard = document.getElementById('whiteboard');
          addStream(whiteboard, stream.getVideoTracks()[0]);
        },
      });
    });
  }

  let turnServerConfig;
  const response = await fetch('/turncreds');
  if (response.status === 200) {
    const {
      active, username, password, uri,
    } = await response.json();
    turnServerConfig = active ? [{ username, credential: password, urls: uri }] : [];
  }
  Janus.init({
    callback() {
      janus = new Janus(
        {
          debug: 'all',
          server: janusUrl,
          iceServers: [{ username: 'username1', credential: 'key1', urls: 'turn:3.83.48.163:3478' }],
          iceTransportPolicy: 'relay',
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
