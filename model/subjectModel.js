const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Student = require('./studentModel');

const userDataSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: [true, 'User must enter subject name'],
            trim: true,
        },
        totalNumLecture: {
            type: Number,
            default: 0,
            required: [true, 'Student must enter the total number of lectures'],
        },
        attendanceRecords: [
            {
                holiday: {
                    type: Boolean,
                    default: true,
                },
                date: {
                    type: Date,
                    required: true,
                },
                isPresent: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        attendancePercent: {
            type: Number,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// userDataSchema.pre('save', async function (next) {
//     const userData = this;

//     // Find the corresponding student document and update its 'userData' array
//     const student = await mongoose.model('Student').findById(userData.user);

//     if (!student) {
//         return next(new AppError('User not found !! 😒😒'));
//     }
//     const subjectExists = student.subject.includes(userData.subject);

//     if (!subjectExists) {
//         student.subject.push(userData.subject);
//     }
//     await student.save();
//     next();
// });

//calculating attendance percent
const calcAttendanceRecord = (attendanceRecords) => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
        return 0;
    }
    const totalLectures = attendanceRecords.length;
    const presentLectures = attendanceRecords.filter(
        (records) => records.isPresent
    ).length;

    const percentage = (presentLectures / totalLectures) * 100;

    return parseFloat(percentage.toFixed(2));
};

//writing the post middleware cuz we need to update once data is stored in database
userDataSchema.post('save', async function () {
    const studentId = this.user;

    const attendanceRecords = this.attendanceRecords;
    console.log(attendanceRecords);

    const attendancePercent = calcAttendanceRecord(attendanceRecords);
    console.log(attendancePercent);
    //Update the attendance percent
    try {
        await Subject.updateOne(
            { user: studentId },
            { $set: { attendancePercent } }
        );
    } catch (error) {
        console.error('Error updating attendance percentage:', error);
    }
});

//modelling the subject
const Subject = mongoose.model('Subject', userDataSchema);

module.exports = Subject;
