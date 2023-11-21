import axios from 'axios';
import { showAlert } from './alert';

export const updateStudentData = async (data) => {
    try {
        const update = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v2/student/updateMe',
            data,
        });

        console.log('Response : ', data);

        if (update.data.status === 'success') {
            showAlert('success', `Data Updated Successfully`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const updateStudentPassword = async (
    currentPassword,
    password,
    confirmPassword
) => {
    try {
        const updateData = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v2/student/updatePassword',

            data: {
                currentPassword,
                password,
                confirmPassword,
            },
        });
        console.log('Response:', updateData);

        if (updateData.data.status === 200) {
            showAlert('success', `Password Updated Successfully`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
