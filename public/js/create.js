let create_but = document.querySelector('#create-lecture');

create_but.addEventListener('click', e => {
    e.preventDefault()
    var xhr = new XMLHttpRequest()
    let name = document.querySelector('#lectureName');
    let email = document.querySelector('#email');
    var lecture_name = name.value;
    var lecture_email = email.value;
    xhr.open('POST', '/create', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            const response = JSON.parse(this.response)
            window.location = response.redirectUrl;
        }
    }
    xhr.send(JSON.stringify({
        name: lecture_name,
        email: lecture_email,
        time: new Date(),
    }));
});