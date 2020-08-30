import { toggleSpeakers } from '../utility.js';

const hasAudio = $('#audioValidator').val() === 'true';
const hasWebcam = $('#webcamValidator').val() === 'true';

export function showConfigModal() {
  $('#join-content').hide();
  $(`#${hasAudio ? 'mic-content' : 'webcam-content'}`).show();
  $(`#goto-${hasAudio ? 'audio' : 'video'}-settings`).css('opacity', 1);
  $('#device-configuration-header').show();
}

export default function initializeStreamConfigurations(stream, changeTrack) {
  let currentAudioDevice;
  let currentVideoDevice;
  let webcamTestToggler = false;

  function hideConfigModal() {
    $('#join-content').show();
    $('#mic-content').hide();
    $('#webcam-content').hide();
    $('#device-configuration-header').hide();
    $('#goto-video-settings').css('opacity', 0.5);
    $('#goto-audio-settings').css('opacity', 0.5);
    if (webcamTestToggler) $('#test-webcam-button').click();
  }

  $('.waiting-for-devices').fadeOut(() => $('#open-device-configuration').fadeIn());

  document.getElementById('open-device-configuration').addEventListener('click', showConfigModal);

  document.getElementById('go-back').addEventListener('click', hideConfigModal);


  if (stream.getAudioTracks().length > 0) {
    document.getElementById('goto-audio-settings').addEventListener('click', function () {
      $('#webcam-content').hide();
      $('#goto-video-settings').css('opacity', 0.5);
      $('#mic-content').show();
      $(this).css('opacity', 1);
    });

    // mute mic
    $('.mute-mic').click(function () {
      const muteicon = document.getElementById('mute-icon');
      const mutedicon = document.getElementById('muted-icon');
      const micButtonSide = $('#toggle-mic');
      if (stream.getAudioTracks()[0].enabled) {
        micButtonSide.removeClass('fa-microphone');
        micButtonSide.addClass('fa-microphone-slash');
        const unmuteText = $('#unmute-text').val();
        this.title = unmuteText;
        $('#toggle-mute-text').html(unmuteText);
        muteicon.style.display = 'none';
        mutedicon.style.display = 'block';
        stream.getAudioTracks()[0].enabled = false;
      } else {
        micButtonSide.addClass('fa-microphone');
        micButtonSide.removeClass('fa-microphone-slash');
        const muteText = $('#mute-text').val();
        muteicon.style.display = 'block';
        mutedicon.style.display = 'none';
        this.title = muteText;
        $('#toggle-mute-text').html(muteText);
        stream.getAudioTracks()[0].enabled = true;
      }
    });

    $('#toggle-speaker').click(function () {
      $(this).toggleClass('fa-volume-up');
      $(this).toggleClass('fa-volume-mute');
      toggleSpeakers();
    });

    // test mic
    let test = false;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    document.getElementById('test-mic-button').addEventListener('click', () => {
      let mediaStreamSource = null;
      let meter = null;
      test = !test;

      if (test) {
        document.getElementById('test-mic-button').innerHTML = $('#stop-test-audio-text').val();
        audioContext.resume();
      } else if (!test) {
        document.getElementById('test-mic-button').innerHTML = $('#check-audio-text').val();
        audioContext.suspend();
        document.querySelectorAll('.myProgress').forEach((e) => { e.style.backgroundColor = 'grey'; });
      }

      mediaStreamSource = audioContext.createMediaStreamSource(stream);
      meter = createAudioMeter(audioContext);

      mediaStreamSource.connect(meter);


      function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
        const processor = audioContext.createScriptProcessor(512);
        processor.onaudioprocess = volumeAudioProcess;
        processor.clipping = false;
        processor.lastClip = 0;
        processor.volume = 0;
        processor.clipLevel = clipLevel || 0.98;
        processor.averaging = averaging || 0.95;
        processor.clipLag = clipLag || 750;

        // this will have no effect, since we don't copy the input to the output,
        // but works around a current Chrome bug.
        processor.connect(audioContext.destination);

        processor.checkClipping = function () {
          if (!this.clipping) {
            return false;
          }
          if ((this.lastClip + this.clipLag) < window.performance.now()) {
            this.clipping = false;
          }
          return this.clipping;
        };
        processor.shutdown = function () {
          this.disconnect();
          this.onaudioprocess = null;
        };

        return processor;
      }

      function volumeAudioProcess(event) {
        const buf = event.inputBuffer.getChannelData(0);
        const bufLength = buf.length;
        let sum = 0;
        let x;
        // Do a root-mean-square on the samples: sum up the squares...
        for (let i = 0; i < bufLength; i++) {
          x = buf[i];
          if (Math.abs(x) >= this.clipLevel) {
            this.clipping = true;
            this.lastClip = window.performance.now();
          }
          sum += x * x;
        }

        // ... then take the square root of the sum.
        const rms = Math.sqrt(sum / bufLength) * 100;

        // Now smooth this out with the averaging factor applied
        // to the previous sample - take the max here because we
        // want "fast attack, slow release."
        this.volume = Math.max(rms, this.volume * this.averaging);
        const percentage = Math.round(this.volume / 4);

        function lightUp(num) {
          document.querySelectorAll('.myProgress').forEach((e) => { e.style.backgroundColor = 'grey'; });

          document.querySelectorAll('.myProgress').forEach((e, i) => {
            if (i <= num) {
              if (i < 7) {
                e.style.backgroundColor = 'green';
              } else if (i >= 7 && i < 13) {
                e.style.backgroundColor = 'yellow';
              } else if (i >= 13 && i < 19) {
                e.style.backgroundColor = 'orange';
              } else {
                e.style.backgroundColor = 'red';
              }
            }
          });
        }

        setInterval(lightUp(percentage), 500);
      }
    });

    stream.getAudioTracks().forEach((track) => {
      currentAudioDevice = track.label;
    });
  }

  if (stream.getVideoTracks().length > 0) {
    document.getElementById('goto-video-settings').addEventListener('click', function () {
      $('#mic-content').hide();
      $('#goto-audio-settings').css('opacity', 0.5);
      $('#webcam-content').show();
      $(this).css('opacity', 1);
    });

    document.getElementById('test-webcam-button').addEventListener('click', function () {
      webcamTestToggler = !webcamTestToggler;
      $(this).html($(`#${webcamTestToggler ? 'stop-test-webcam-text' : 'check-webcam-text'}`).val());
      const testVideoSrc = document.getElementById('test-webcam-src');
      const testStream = new MediaStream();
      testStream.addTrack(stream.getVideoTracks()[0]);
      testVideoSrc.srcObject = webcamTestToggler ? testStream : null;
    });

    stream.getVideoTracks().forEach((track) => {
      currentVideoDevice = track.label;
    });
  }

  function gotDevices(deviceInfos) {
    for (let i = 0; i !== deviceInfos.length; ++i) {
      let changeTrackDeviceId;
      const deviceInfo = deviceInfos[i];
      const newSpan = document.createElement('span');
      newSpan.value = deviceInfo.deviceId;
      newSpan.textContent = deviceInfo.label;
      newSpan.classList.add('custom-option');
      if (deviceInfo.kind === 'audioinput' && hasAudio) {
        document.getElementById('select-options-audio').appendChild(newSpan);
        changeTrackDeviceId = { audio: deviceInfo.deviceId };
      } else if (deviceInfo.kind === 'videoinput' && hasWebcam) {
        document.getElementById('select-options-webcam').appendChild(newSpan);
        changeTrackDeviceId = { video: deviceInfo.deviceId };
      }

      if (deviceInfo.label === currentAudioDevice || deviceInfo.label === currentVideoDevice) {
        newSpan.classList.add('selected');
        newSpan.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = newSpan.textContent;
      }

      newSpan.addEventListener('click', function () {
        if (!this.classList.contains('selected')) {
          this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
          this.classList.add('selected');
          this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = this.textContent;
          if (deviceInfo.kind === 'videoinput' && webcamTestToggler) {
            $('#test-webcam-button').click();
          }
          changeTrack(stream, changeTrackDeviceId);
        }
      });
    }
  }

  if (hasWebcam || hasAudio) {
    let currentDevices = [];
    setInterval(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        if (currentDevices.length !== devices.length) {
          if (hasAudio) {
            document.getElementById('select-options-audio').innerHTML = '';
          }
          if (hasWebcam) {
            document.getElementById('select-options-webcam').innerHTML = '';
          }
          currentDevices = devices;
          gotDevices(devices);
        }
      });
    }, 2000);
  }

  document.querySelectorAll('.custom-select-wrapper').forEach((selectInput) => {
    selectInput.addEventListener('click', function () {
      this.querySelector('.custom-select').classList.toggle('open');
    });
  });

  let click = 0;
  window.addEventListener('click', (e) => {
    const select = document.querySelector('.custom-select');
    const modal = document.querySelector('.modal-content');

    if (!select.classList.contains('open') && modal.classList.contains('lecture') && !modal.contains(e.target)) {
      if (click > 0) {
        $('#welcome-lecture-modal').hide();
        modal.classList.remove('lecture');
        hideConfigModal();
        click = 0;
      } else {
        click++;
      }
    }
    if (!select.contains(e.target)) {
      select.classList.remove('open');
    }
  });
}
