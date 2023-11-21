import axios from 'axios';
import { showAlert } from './alert';

export const deleteSubjectData = async (subjectId) => {
    try {
        const response = await axios({
            method: 'DELETE',
            url: `http://127.0.0.1:3000/api/v2/subject/deleteSubject/${subjectId}`,
        });
        console.log(response);

        showAlert('success', 'Subject Deleted Successfully');

        window.setTimeout(() => {
            location.assign('/subjectsOverview');
        }, 1500);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
