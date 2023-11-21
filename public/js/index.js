import '@babel/polyfill';

import { signUp } from './signUp';

import { logIn } from './logIn';
import { logOut } from './logIn';
import { addData } from './addSubjects';

import { markAttendance } from './markAttendance';

import { updateStudentData } from './updateSetting';

import { updateStudentPassword } from './updateSetting';

import { updateSubjectData } from './updateSubjectData';

import { deleteSubjectData } from './delete';

const signUpForm = document.querySelector('.form--signUp');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

const addSubjectForm = document.querySelector('#add_form');
const markAttendanceForm = document.getElementById('markAttendance_form');
const updateAttendanceForm = document.getElementById('updateAttendance_form');
const updateData = document.querySelector('.form-user-data');

const deleteSubject = document.getElementById('deleteSubjectForm');

const newPassword = document.querySelector('.form-user-password');

if (updateData) {
    updateData.addEventListener('submit', (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        updateStudentData(form);
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        logIn(email, password);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logOut);
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
if (updateAttendanceForm) {
    updateAttendanceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const holiday = document.getElementById('name').value;
        const isPresent = document.getElementById('isPresent').value;

        // Get the current URL

        const isPresentModified =
            isPresent === 'Present' || isPresent === 'present' ? true : false;

        const holidayModified =
            holiday === 'Yes' || holiday === 'yes' ? true : false;

        const currentURL = window.location.href;

        // Use regular expressions to extract the subjectId from the URL
        const subjectId = currentURL.match(/\/updateAttendance\/([^/]+)/)[1];
        const date = currentURL.match(/\/updateAttendance\/[^/]+\/([^/]+)/)[1];

        updateSubjectData(subjectId, date, holidayModified, isPresentModified);
    });
}

if (newPassword) {
    newPassword.addEventListener('submit', async (e) => {
        e.preventDefault();

        const existingPassword =
            document.querySelector('#password-current').value;
        const password = document.querySelector('#password').value;
        const confirmPassword =
            document.querySelector('#password-confirm').value;

        await updateStudentPassword(
            existingPassword,
            password,
            confirmPassword
        );

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (deleteSubject) {
    deleteSubject.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Clicked');
        const currentURL = window.location.href;

        const subjectId = currentURL.match(/\/deleteSubject\/([^/]+)/)[1];

        deleteSubjectData(subjectId);
    });
}
