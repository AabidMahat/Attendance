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
        Image: {
            type: String,
            default: 'default.avif',
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
userDataSchema.pre('save', function (next) {
    const totalRecords = this.attendanceRecords.length;
    const presentRecords = this.attendanceRecords.filter(
        (record) => record.isPresent
    ).length;

    // Calculate attendance percentage
    if (totalRecords > 0) {
        this.attendancePercent = parseFloat(
            (presentRecords / totalRecords) * 100
        ).toFixed(2);
    } else {
        this.attendancePercent = 0; // Set attendancePercent to 0 if there are no records
    }

    next();
});

//Adding Image to database
userDataSchema.pre('save', function () {
    if (this.subject === 'Java') {
        this.Image = 'java.png';
    }
    if (this.subject === 'Machine Learning') {
        this.Image = 'machine.png';
    }
    if (this.subject === 'Database Engineering') {
        this.Image = 'database.png';
    }
    if (this.subject === 'MIR') {
        this.Image = 'MIR.png';
    }
    if (this.subject === 'Operating System') {
        this.Image = 'Os.png';
    }
});

//modelling the subject
const Subject = mongoose.model('Subject', userDataSchema);

module.exports = Subject;
