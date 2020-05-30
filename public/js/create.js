let is_valid_email
let create_but = document.querySelector('#create-lecture');
let invalidEmailDiv = document.getElementById('invalid-email')
let emailInput = document.querySelector('#email')

create_but.addEventListener('click', e => {
    e.preventDefault()
    var xhr = new XMLHttpRequest()
    let name = document.querySelector('#lectureName');
    var lecture_name = name.value;
    var lecture_email = emailInput.value;
    if(lecture_email === "" || isValidEmail(lecture_email)){
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
    }else{
        invalidEmailDiv.style.opacity = 1
    }
});

emailInput.addEventListener('input', e => {
    invalidEmailDiv.style.opacity = 0
})


function isValidEmail(email){
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}
