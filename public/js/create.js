/* eslint-disable no-useless-escape */
/* eslint-disable func-names */
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
  const xhr = new XMLHttpRequest();
  const lectureName = nameInput.value;
  const lectureEmail = emailInput.value;
  if (lectureName === '') {
    invalidEmailDiv.style.opacity = 0;
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
    }));
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
