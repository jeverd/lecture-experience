/* eslint-disable no-loop-func */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */

export default function initModal(stream) {
  // Mic button
  document.getElementById('test-mic').addEventListener('click', () => {
    const joinContent = document.getElementById('join-content');
    const micContent = document.getElementById('mic-content');
    joinContent.style.display = 'none';
    micContent.style.display = 'block';
  });

  // back button
  document.getElementById('go-back').addEventListener('click', () => {
    const joinContent = document.getElementById('join-content');
    const micContent = document.getElementById('mic-content');
    micContent.style.display = 'none';
    joinContent.style.display = 'block';
  });

  // mute mic
  document.getElementById('mute-mic').addEventListener('click', function () {
    const muteicon = document.getElementById('mute-icon');
    const mutedicon = document.getElementById('muted-icon');
    if (stream.getAudioTracks()[0].enabled) {
      this.title = 'Unmute';
      muteicon.style.display = 'none';
      mutedicon.style.display = 'block';
      stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
    } else {
      muteicon.style.display = 'block';
      mutedicon.style.display = 'none';
      this.title = 'Mute';
      stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
    }
  });


  // test mic
  let test = false;
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  document.getElementById('test-mic-button').addEventListener('click', () => {
    let mediaStreamSource = null;
    let meter = null;
    test = !test;


    if (test) {
      document.getElementById('test-mic-button').innerHTML = 'Stop Test';
      audioContext.resume();
    } else if (!test) {
      document.getElementById('test-mic-button').innerHTML = 'Check Mic';
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

  // change the current mic device
  /*
  function chengeTrack(currentDeviceId){
    var mediaParams = {video:false,
      audio: {mandatory: {deviceId: currentDeviceId}}
    };
    peerConnection.removeStream(peerConnection.getLocalStreams()[0]);
    peerConnection.addLocalStream(stream);
  }
 */

  // Start Select input
  let currentDevice;
  stream.getAudioTracks().forEach((e) => { currentDevice = e.getCapabilities().deviceId; });

  navigator.mediaDevices.enumerateDevices().then(gotDevices);

  function gotDevices(deviceInfos) {
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      const newSpan = document.createElement('span');
      newSpan.value = deviceInfo.deviceId;

      if (deviceInfo.kind === 'audioinput') {
        newSpan.textContent = deviceInfo.label;
        newSpan.classList.add('custom-option');
        document.getElementById('select-options').appendChild(newSpan);

        if (deviceInfo.deviceId === currentDevice) {
          newSpan.classList.add('selected');
          newSpan.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = newSpan.textContent;
        }

        newSpan.addEventListener('click', function () {
          if (!this.classList.contains('selected')) {
            this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
            this.classList.add('selected');
            this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = this.textContent;
            changeTrack(newSpan.value);
          }
        });
      }
    }
  }


  document.querySelector('.custom-select-wrapper').addEventListener('click', function () {
    this.querySelector('.custom-select').classList.toggle('open');
  });

  let click = 0;
  window.addEventListener('click', (e) => {
    const select = document.querySelector('.custom-select');
    const modal = document.querySelector('.modal-content');

    if (!select.classList.contains('open') && modal.classList.contains('lecture') && !modal.contains(e.target)) {
      if (click > 0) {
        $('#welcome-lecture-modal').hide();
        modal.classList.remove('lecture');
        click = 0;
      } else {
        click++;
      }
    }
    if (!select.contains(e.target)) {
      select.classList.remove('open');
    }
  });

  // End Select input
}
