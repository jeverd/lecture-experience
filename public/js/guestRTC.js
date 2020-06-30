/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */

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

export default function initializeGuestRTC(roomId) {
  let janus;
  let handle;
  Janus.init({
    callback() {
      janus = new Janus(
        {
          debug: 'all',
          server: 'http://localhost:8088/janus',
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
                onmessage(msg, jsep) {
                  console.log(msg);
                  if (msg.videoroom === 'joined') {
                    msg.publishers.forEach((publisher) => {
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
                          console.log(msg);
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
                          const speaker = document.getElementById('speaker');
                          const whiteboard = document.getElementById('whiteboard');
                          addStream(speaker, stream.getAudioTracks()[0]);
                          addStream(whiteboard, stream.getVideoTracks()[0]);
                        },
                      });
                    });
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