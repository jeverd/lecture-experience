/* eslint-disable no-loop-func */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const { Janus } = require('janus-videoroom-client');
const janus = new Janus({
  url: 'ws://localhost:8188',
});

janus.connect();
janus.onConnected(() => {
  janus.createSession().then((session) => {
    session.videoRoom().getFeeds('8785741013177773').then((feeds) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const feed of feeds) {
        console.log(feed);
        session.videoRoom().listenFeed('8785741013177773', feed).then((listener) => {
          const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
          const pc = new RTCPeerConnection(configuration);

          pc.onicecandidate = (event) => {
            if (event.candidate == null) {
              listenerHandle.trickleCompleted();
            } else {
              listenerHandle.trickle(event.candidate);
            }
          };

          pc.ontrack = function (event) {
            console.log('ontrack', event);
          };
          const listenerOffer = listenerHandle.getOffer();
          pc.setRemoteDescription(listenerOffer).then(() => {
            pc.createAnswer().then((answer) => {
              pc.setLocalDescription(answer).then(() => {
                listenerHandle.setRemoteAnswer(answer.sdp);
              });
            });
          });
        });
      }
    });
  });
});


// janus.createSession().then((session)=>{
//     console.log(session)
// });
