import axios from 'axios';
import { showAlert } from './alert';

export const signUp = async (name, email, password, confirmPassword) => {
    try {
        const newUser = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v2/student/signUp',
            data: {
                name,
                email,
                password,
                confirmPassword,
            },
        });

        console.log('Response ', newUser);
        if (newUser.data.status === 'Success') {
            showAlert('success', 'Mail is send to your inbox');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
