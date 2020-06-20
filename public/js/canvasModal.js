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


// Start Select input
document.querySelector('.custom-select-wrapper').addEventListener('click', function () {
  this.querySelector('.custom-select').classList.toggle('open');
});

for (const option of document.querySelectorAll('.custom-option')) {
  option.addEventListener('click', function () {
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

const
  range = document.getElementById('range');
const rangeV = document.getElementById('rangeV');
const miccontent = document.getElementById('mic-content');
setValue = () => {
  const
    newValue = Number((range.value - range.min) * 100 / (range.max - range.min));
  const newPosition = 10 - (newValue * 0.2);
  rangeV.innerHTML = `<span>${range.value}</span>`;
  rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
};
document.addEventListener('DOMContentLoaded', setValue);
range.addEventListener('input', setValue);
miccontent.addEventListener('click', () => { rangeV.style.display = 'none'; });
