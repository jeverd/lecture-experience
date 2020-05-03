let create_but = document.querySelector('#create-lecture');

create_but.addEventListener('click', e => {
    e.preventDefault()
    var xhr = new XMLHttpRequest()
    let lecture_name = 'Math Class'
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
        time: new Date(),
        size: 128
    }));
});