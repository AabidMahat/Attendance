import axios from 'axios';

import { showAlert } from './alert';

export const addData = async (subject, totalNumLecture) => {
    try {
        const subjects = await axios({
            method: 'POST',
            url: '/api/v2/subject/addSubject',
            data: {
                subject,
                totalNumLecture,
            },
        });
        console.log(subjects);

        showAlert('success', 'Subject Added Successfully');
        window.setTimeout(() => {
            location.assign('/subjectsOverview');
        }, 1500);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
