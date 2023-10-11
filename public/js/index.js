import '@babel/polyfill';

import { signUp } from './signUp';

const signUpForm = document.querySelector('.form--signUp');

if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword =
            document.getElementById('confirmPassword').value;
        signUp(name, email, password, confirmPassword);
    });
}
