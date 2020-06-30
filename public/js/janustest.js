/* eslint-disable no-undef */
let whoami;
do {
  whoami = prompt('publisher or subscriber?');
} while (whoami !== 'publisher' && whoami !== 'subscriber');

const elem = document.createElement('span');
elem.innerHTML = whoami;
document.querySelector('body').appendChild(elem);

const myroom = 12345;
const id = 123;
let janus;
let handle;
if (whoami === 'publisher') {
  Janus.init({
    debug: 'all',
    callback() {
      janus = new Janus(
        {
          server: 'https://liteboard.io/janus',
          success() {
          // Attach to VideoRoom plugin
            janus.attach(
              {
                plugin: 'janus.plugin.videoroom',
                success(pluginHandle) {
                  console.log('success plugin');
                  handle = pluginHandle;
                  const joinRoom = () => {
                    handle.send({
                      message: {
                        request: 'join', ptype: 'publisher', room: myroom,
                      },
                    });
                  };
                  handle.send({
                    message: { request: 'exists', room: myroom },
                    success(r) {
                      if (!r.exists) {
                        handle.send({
                          message: { request: 'create', room: myroom },
                          success(re) {
                            if (re.videoroom === 'created') {
                              joinRoom();
                            }
                          },
                        });
                      } else {
                        joinRoom();
                      }
                    },
                  });
                },
                error(error) {
                  console.log('error plugin connection');
                },
                onmessage(msg, jsep) {
                  console.log('incoming msg', msg, jsep);
                  if (jsep) {
                    if (jsep.type === 'answer') {
                      handle.handleRemoteJsep({ jsep });
                    }
                  }
                  if (msg.videoroom === 'joined') {
                    console.log('JOINED PUBLISHER', msg, jsep);
                    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                      console.log('creating offer');
                      handle.createOffer({
                        stream,
                        success(theRightJsep) {
                          handle.send({
                            message: { request: 'configure', video: false, audio: true },
                            jsep: theRightJsep,
                          });
                        },
                      });
                    });
                  }
                },
                onlocalstream(stream) {
                  console.log('LOCALSTREAM AVAILABLE');
                  document.querySelector('audio').srcObject = stream;
                },
                onremotestream(stream) {
                  console.log('REMOTE STREAM AVAILABLE');
                  console.log(stream);
                // The publisher stream is sendonly, we don't expect anything here
                },
                oncleanup() {

                },
              },
            );
          },
          error(error) {
            console.log(error);
          },
          destroyed() {
          // window.location.reload();
          },
        },
      );
    },
  });
} else {
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
                  console.log('success plugin');
                  handle = pluginHandle;
                  handle.send({
                    message: {
                      request: 'join', ptype: 'publisher', room: myroom,
                    },
                  });
                },
                error(error) {
                  console.log('error plugin conenciton');
                },
                onmessage(msg, jsep) {
                  console.log('MESSAGE DESGRACA', msg, jsep);
                  if (msg.videoroom === 'joined') {
                    msg.publishers.forEach((publisher) => {
                      let remoteHandle;
                      janus.attach({
                        plugin: 'janus.plugin.videoroom',
                        success(handle) {
                          remoteHandle = handle;
                          remoteHandle.send({
                            message: {
                              request: 'join', ptype: 'subscriber', room: myroom, feed: publisher.id,
                            },
                          });
                        },
                        onmessage(msg, curjsep) {
                          console.log('INCOMING MSG:', msg, curjsep);
                          const event = msg.videoroom;
                          if (event === 'attached') {
                            remoteHandle.rfid = msg.id;
                            remoteHandle.rfdisplay = msg.display;
                          }
                          if (curjsep) {
                            remoteHandle.createAnswer({
                              jsep: curjsep,
                              media: {
                                audioSend: false, videoSend: false,
                              },
                              success(ourjsep) {
                                remoteHandle.send({ message: { request: 'start', room: myroom }, jsep: ourjsep });
                              },
                            });
                          }
                        },
                        onlocalstream(stream) {
                          console.log('LOCAL STREAM AVAILABLE subs');
                          console.log(stream);
                        },
                        onremotestream(stream) {
                          console.log('REMOTE STREAM AVAILABLE subs', stream);
                          document.querySelector('audio').srcObject = stream;
                        },
                      });
                    });
                  }
                },
                onlocalstream(stream) {
                  console.log('LOCAL STREAM AVAILABLE');
                  console.log(stream);
                },
                onremotestream(stream) {
                  console.log('REMOTE STREAM AVAILABLE');
                  console.log(stream);
                // The publisher stream is sendonly, we don't expect anything here
                },
                oncleanup() {

                },
              },
            );
          },
          error(error) {
            console.log(error);
          },
          destroyed() {
          // window.location.reload();
          },
        },
      );
    },
  });
}
