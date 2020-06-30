/* eslint-disable no-undef */
export default function initializeManagerRTC(roomId, stream) {
  let janus;
  let janusHandler;

  Janus.init({
    debug: 'all',
    callback() {
      janus = new Janus({
        server: 'https://liteboard.io/janus',
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { url: 'stun:stun01.sipphone.com' },
          { url: 'stun:stun.ekiga.net' },
          { url: 'stun:stunserver.org' },
          { url: 'stun:stun.softjoys.com' },
          { url: 'stun:stun.voiparound.com' },
          { url: 'stun:stun.voipbuster.com' },
          { url: 'stun:stun.voipstunt.com' },
          { url: 'stun:stun.voxgratia.org' },
          { url: 'stun:stun.xten.com' },
        ],
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
