/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import { getJanusUrl } from '../utility.js';

export default async function initializeManagerRTC(roomId, stream) {
  const janusUrl = getJanusUrl();
  let janus;
  let janusHandler;
  let turnServerConfig;
  const response = await fetch('/turncreds');
  if (response.status === 200) {
    const {
      active, username, password, uri,
    } = await response.json();
    turnServerConfig = active ? [{ username, credential: password, urls: uri }] : [];
  }

  Janus.init({
    debug: 'all',
    callback() {
      janus = new Janus({
        server: janusUrl,
        iceServers: turnServerConfig,
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
