import '@babel/polyfill';

import { signUp } from './signUp';
import { logIn } from './logIn';
import { addData } from './addSubjects';

const signUpForm = document.querySelector('.form--signUp');
const loginForm = document.querySelector('.form--login');
const addSubjectForm = document.querySelector('#add_form');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        logIn(email, password);
    });
}

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

if (addSubjectForm) {
    addSubjectForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        const subject = document.getElementById('name').value;
        const totalNumLecture = document.getElementById('email').value;

        addData(subject, totalNumLecture);
    });
}
