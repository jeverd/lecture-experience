let email_but = document.querySelector('#get-email');

email_but.addEventListener('click', e => {
    e.preventDefault()
    var xhr = new XMLHttpRequest()
    xhr.open('POST', '/email', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            const response = JSON.parse(this.response)
            window.location = response.redirectUrl;
        }
    }
    xhr.send(JSON.stringify({
        managerId: "d145c691-345f-4f35-89d2-6db2a36de580"
    }));
});