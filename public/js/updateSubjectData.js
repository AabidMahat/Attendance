import axios from 'axios';
import { showAlert } from './alert';

export const updateSubjectData = async (
    subjectId,
    date,
    newHoliday,
    newIsPresent
) => {
    try {
        const updateData = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:3000/api/v2/subject/updateAttendance/${subjectId}/${date}`,
            // 'http://127.0.0.1:3000/api/v2/student/logIn'
            data: {
                holiday: newHoliday,
                isPresent: newIsPresent,
            },
        });
        showAlert('success', `Attendance Updated Successfully`);
        window.setTimeout(() => {
            location.assign('/subjectsOverview');
        }, 1500);
    } catch (error) {
        showAlert('error', `Error while Updating`);
    }
};
