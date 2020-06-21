/* eslint-disable func-names */

function initModal(stream){


}
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

//mute mic
document.getElementById('mute-mic').addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream) {
    stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled)

  })

})

navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream) {
  stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled)
  stream.getAudioTracks().forEach((e)=>{e.enabled=false})

})

document.getElementById('test-mic-button').addEventListener('click', () => {
  let audioContext;
  let mediaStreamSource = null;
  let meter = null;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled)
      mediaStreamSource = audioContext.createMediaStreamSource(stream);
      meter = createAudioMeter(audioContext);
      mediaStreamSource.connect(meter);
    });
  }


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

    document.getElementById('audio-value').innerHTML = percentage;

    function light_up(num) {
      document.querySelectorAll('.myProgress').forEach((e)=>{e.style.backgroundColor = 'grey'});

      document.querySelectorAll('.myProgress').forEach((e,i)=>{
        if(i<=num){
          e.style.backgroundColor = 'blue'
        }
       }) 
    }                                                 

    setInterval(light_up(percentage),500);

  }
});

// Start Select input
navigator.mediaDevices.enumerateDevices().then(gotDevices);
navigator.mediaDevices.getUserMedia({ audio: true }).then((audioid) => console.log(audioid.id));

function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const newSpan = document.createElement('span');
    newSpan.value = deviceInfo.deviceId;
    console.log(deviceInfo.id);
    if (deviceInfo.kind === 'audioinput') {
      newSpan.textContent = deviceInfo.label;
      newSpan.classList.add('custom-option');
      document.getElementById('select-options').appendChild(newSpan);
    }
  }
}


document.querySelector('.custom-select-wrapper').addEventListener('click', function () {
  this.querySelector('.custom-select').classList.toggle('open');
});

for (const option of document.querySelectorAll('.custom-option')) {
  option.addEventListener('click', () => {
    if (!this.classList.contains('selected')) {
      this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
      this.classList.add('selected');
      this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = this.textContent;
    }
  });
}
window.addEventListener('click', (e) => {
  const select = document.querySelector('.custom-select');
  if (!select.contains(e.target)) {
    select.classList.remove('open');
  }
});

// End Select input

// Start Volume Input//

const range = document.getElementById('range');
const rangeV = document.getElementById('rangeV');
const miccontent = document.getElementById('mic-content');
const setValue = () => {
  const newValue = Number((range.value - range.min) * 100 / (range.max - range.min));
  const newPosition = 10 - (newValue * 0.2);
  rangeV.innerHTML = `<span>${range.value}</span>`;
  rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
};
document.addEventListener('DOMContentLoaded', setValue);
range.addEventListener('input', setValue);
miccontent.addEventListener('click', () => { rangeV.style.display = 'none'; });

/*
navigator.mediaDevices.enumerateDevices().then((devices)=>{
    devices.forEach((e)=>console.log(e));
})
*/
