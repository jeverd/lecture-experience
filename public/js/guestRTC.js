/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
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
                          console.log(stream);
                          document.getElementById('whiteboard').srcObject = stream;
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