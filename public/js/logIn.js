import axios from 'axios';
import { showAlert } from './alert';

export const logIn = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v2/student/logIn',
            data: {
                email,
                password,
            },
        });
        console.log(res);
        if (res.data.status === 200) {
            showAlert('success', 'Logged In successfully');

            window.setTimeout(() => {
                location.assign('/subjectsOverview');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
