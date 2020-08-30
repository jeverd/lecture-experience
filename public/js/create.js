import { buildPostRequestOpts, getJanusUrl, getJanusToken } from './utility.js';

const janusUrl = getJanusUrl();
const createBut = document.querySelector('#create-lecture');
const invalidEmailDiv = document.getElementById('invalid-email');
const invalidNameDiv = document.getElementById('invalid-lecturename');
const invalidToolsDiv = document.getElementById('invalid-tools');
const invalidAudioDiv = document.getElementById('select-video');
const emailInput = document.querySelector('#email');
const nameInput = document.querySelector('#lectureName');
const audioCheckbox = document.querySelector('#audio-check');
const whiteboardCheckbox = document.querySelector('#whiteboard-check');
const webcamCheckbox = document.querySelector('#webcam-check');
function isValidEmail(email) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

createBut.addEventListener('click', async (e) => {
  e.preventDefault();
  const lectureName = nameInput.value;
  const lectureEmail = emailInput.value;
  if (!audioCheckbox.checked && !webcamCheckbox.checked && !whiteboardCheckbox.checked) {
    invalidToolsDiv.style.opacity = 1;
    invalidEmailDiv.style.opacity = 0;
    invalidNameDiv.style.opacity = 0;
    invalidAudioDiv.style.opacity = 0;
  } else if (audioCheckbox.checked && !webcamCheckbox.checked && !whiteboardCheckbox.checked) {
    invalidToolsDiv.style.opacity = 0;
    invalidEmailDiv.style.opacity = 0;
    invalidNameDiv.style.opacity = 0;
    invalidAudioDiv.style.opacity = 1;
  } else if (lectureName === '') {
    invalidToolsDiv.style.opacity = 0;
    invalidEmailDiv.style.opacity = 0;
    invalidNameDiv.style.opacity = 1;
    invalidAudioDiv.style.opacity = 0;
  } else if (lectureEmail === '' || isValidEmail(lectureEmail)) {
    const janusToken = await getJanusToken();
    Janus.init({
      debug: 'all',
      callback() {
        const janus = new Janus({
          server: janusUrl,
          token: janusToken,
          success() {
            // Attach to VideoRoom plugin
            janus.attach(
              {
                plugin: 'janus.plugin.videoroom',
                success(pluginHandle) {
                  pluginHandle.send({
                    message: {
                      request: 'create',
                      publishers: 8
                    },
                    success(res) {
                      if (res.videoroom === 'created') {
                        const body = JSON.stringify({
                          name: lectureName,
                          email: lectureEmail,
                          roomId: res.room,
                          lectureTools: {
                            audio: audioCheckbox.checked,
                            webcam: webcamCheckbox.checked,
                            whiteboard: whiteboardCheckbox.checked,
                          },
                        });
                        fetch('/create', buildPostRequestOpts(body))
                          .then((response) => {
                            if (response.status === 200) {
                              response.json().then((json) => {
                                window.location = json.redirectUrl;
                              });
                            }
                          });
                      }
                    },
                  });
                },
              },
            );
          },
        });
      },
    });
  } else {
    invalidNameDiv.style.opacity = 0;
    invalidEmailDiv.style.opacity = 1;
    invalidToolsDiv.style.opacity = 0;
    invalidAudioDiv.style.opacity = 0;
  }
});

emailInput.addEventListener('input', () => {
  invalidEmailDiv.style.opacity = 0;
});

nameInput.addEventListener('input', () => {
  invalidNameDiv.style.opacity = 0;
});
