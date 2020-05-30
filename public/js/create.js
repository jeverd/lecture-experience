/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
const createBut = document.querySelector('#create-lecture');
const invalidEmailDiv = document.getElementById('invalid-email');
const invalidNameDiv = document.getElementById('invalid-lecturename');
const emailInput = document.querySelector('#email');

function isValidEmail(email) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

createBut.addEventListener('click', (e) => {
  e.preventDefault();
  const xhr = new XMLHttpRequest();
  const name = document.querySelector('#lectureName');
  const lectureName = name.value;
  const lectureEmail = emailInput.value;
  if (lectureName === '') {
    invalidNameDiv.style.opacity = 1;
  } else if (lectureEmail === '' || isValidEmail(lectureEmail)) {
    xhr.open('POST', '/create', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        const response = JSON.parse(this.response);
        window.location = response.redirectUrl;
      }
    };

    xhr.send(JSON.stringify({
      name: lectureName,
      email: lectureEmail,
      time: new Date(),
    }));
  } else {
    invalidEmailDiv.style.opacity = 1;
  }
});

emailInput.addEventListener('input', () => {
  invalidEmailDiv.style.opacity = 0;
});
