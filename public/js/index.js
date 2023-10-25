import '@babel/polyfill';

import { signUp } from './signUp';

import { logIn } from './logIn';
import { addData } from './addSubjects';

import { markAttendance } from './markAttendance';

const signUpForm = document.querySelector('.form--signUp');
const loginForm = document.querySelector('.form--login');
const addSubjectForm = document.querySelector('#add_form');
const markAttendanceForm = document.getElementById('markAttendance_form');

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

if (markAttendanceForm) {
    markAttendanceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const holiday = document.getElementById('name').value;
        const date = document.getElementById('email').value;
        const isPresent = document.getElementById('isPresent').value;

        // Get the current URL

        const isPresentModified =
            isPresent === 'Present' || isPresent === 'present' ? true : false;

        const holidayModified =
            holiday === 'Yes' || isPresent === 'yes' ? true : false;

        const dateModified = new Date(date);

        const currentURL = window.location.href;

        // Use regular expressions to extract the subjectId from the URL
        const subjectId = currentURL.match(/\/markAttendance\/([^/]+)/)[1];

        console.log(
            holidayModified,
            dateModified,
            isPresentModified,
            subjectId
        );

        markAttendance(
            holidayModified,
            dateModified,
            isPresentModified,
            subjectId
        );
    });
}
