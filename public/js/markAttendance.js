import axios from 'axios';
import { showAlert } from './alert';

export const markAttendance = async (holiday, date, isPresent, studentId) => {
    try {
        const res = await axios({
            url: `http://127.0.0.1:3000/api/v2/subject/markAttendance/${studentId}`,
            method: 'POST',
            data: {
                holiday,
                date,
                isPresent,
            },
        });
        console.log(res);
        showAlert('success', 'Attendance Marked 😄😄');
        window.setTimeout(() => {
            location.assign('/subjectsOverview');
        }, 1500);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
