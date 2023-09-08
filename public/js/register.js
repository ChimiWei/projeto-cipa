
let matching = Boolean;


var check = function() {
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirm_password').value;
    if(password == confirmPassword) {
        matching = true;
        document.getElementById('message').innerHTML = '';
    } else {
        matching = false;
        document.getElementById('message').style.color = 'red';
        document.getElementById('message').innerHTML = 'Verifique a senha';
    }
}


const form = document.getElementById('registerForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if(matching) {
        form.submit();
    }

});