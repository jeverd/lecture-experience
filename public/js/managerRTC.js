/* eslint-disable no-undef */
export default function initializeManagerRTC(roomId, stream) {
  let janus;
  let janusHandler;

  Janus.init({
    debug: 'all',
    callback() {
      janus = new Janus({
        server: 'http://localhost:8088/janus',
        success() {
          janus.attach({
            plugin: 'janus.plugin.videoroom',
            success(pluginHandle) {
              janusHandler = pluginHandle;
              janusHandler.send({
                message: {
                  request: 'join', ptype: 'publisher', room: roomId,
                },
              });
            },
            onmessage(msg, jsep) {
              console.log(msg);
              if (jsep && jsep.type === 'answer') {
                janusHandler.handleRemoteJsep({ jsep });
              }
              if (msg.videoroom === 'joined') {
                janusHandler.createOffer({
                  stream,
                  success(offerJsep) {
                    janusHandler.send({
                      message: { request: 'configure', video: true, audio: true },
                      jsep: offerJsep,
                    });
                  },
                });
              }
            },
            onlocalstream(stream) {
              // IDEA: ADD A LIVE CANVAS ON THE BOARDS VIEW OF THE CURRENT BOARD
            },
          });
        },
      });
    },
  });
}
