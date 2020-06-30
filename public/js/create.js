/* eslint-disable no-undef */
/* eslint-disable import/extensions */
import { buildPostRequestOpts } from './utility.js';

const createBut = document.querySelector('#create-lecture');
const invalidEmailDiv = document.getElementById('invalid-email');
const invalidNameDiv = document.getElementById('invalid-lecturename');
const emailInput = document.querySelector('#email');
const nameInput = document.querySelector('#lectureName');
function isValidEmail(email) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

createBut.addEventListener('click', (e) => {
  e.preventDefault();
  const lectureName = nameInput.value;
  const lectureEmail = emailInput.value;
  if (lectureName === '') {
    invalidEmailDiv.style.opacity = 0;
    invalidNameDiv.style.opacity = 1;
  } else if (lectureEmail === '' || isValidEmail(lectureEmail)) {
    Janus.init({
      debug: 'all',
      callback() {
        const janus = new Janus({
          server: 'https://liteboard.io/janus',
          success() {
            // Attach to VideoRoom plugin
            janus.attach(
              {
                plugin: 'janus.plugin.videoroom',
                success(pluginHandle) {
                  pluginHandle.send({
                    message: { request: 'create' },
                    success(res) {
                      if (res.videoroom === 'created') {
                        const body = JSON.stringify({
                          name: lectureName,
                          email: lectureEmail,
                          roomId: res.room,
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
                error(error) {
                  console.log('error plugin connection');
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
  }
});

emailInput.addEventListener('input', () => {
  invalidEmailDiv.style.opacity = 0;
});

nameInput.addEventListener('input', () => {
  invalidNameDiv.style.opacity = 0;
});
