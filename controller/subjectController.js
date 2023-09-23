const Subject = require('../model/subjectModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

exports.createNewSubject = async (req, res, next) => {
    try {
        // console.log(req.body);
        const { subject, totalNumLecture } = req.body;
        const userId = req.student._id;
        const newSubject = await Subject.create({
            subject,
            totalNumLecture,
            user: userId,
        });

        if (!newSubject) {
            return next(
                new AppError(
                    'Subject is not created due to some internal issues!!😥😥',
                    500
                )
            );
        }

        res.status(201).json({
            status: 'success',
            data: {
                newSubject,
            },
        });
    } catch (err) {
        res.status(402).json({
            status: 'Failed',
            message: err.message,
        });
    }
};
exports.markAttendance = async (req, res, next) => {
    try {
        const { holiday, date, isPresent } = req.body;
        const userId = req.student._id; // Assuming user is authenticated and available in req
        const subjectId = req.params.subjectId;
        // Find the subject based on subjectId and the user
        const subject = await Subject.findOne({
            _id: subjectId,
            user: userId,
        });

        if (!subject) {
            return next(new AppError('Subject not found 😕😕', 202));
        }

        // Check if there's an existing attendance record
        let existingRecord = subject.attendanceRecords.find(
            (record) => record.date === date
        ); // Assuming only one attendance record per subject

        if (existingRecord) {
            existingRecord.isPresent = isPresent;
            existingRecord.holiday = holiday;
        } else {
            subject.attendanceRecords.push({
                date,
                isPresent,
                holiday,
            });
        }
        //Save the document
        await subject.save();

        res.status(200).json({
            status: 'success',
            data: {
                attendanceRecord: subject.attendanceRecords,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        });
    }
};

exports.getUserSubjectsAndAttendance = async (req, res, next) => {
    try {
        const userId = req.student._id; // Assuming user is authenticated and available in req

        // Retrieve the user's subjects and attendance records for the last 10 days
        const subjectsWithAttendance = await Subject.find({ user: userId })
            .populate('attendanceRecords')
            .exec();

        res.status(200).json({
            status: 'success',
            data: {
                subjectsWithAttendance,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
};

//Implementing aggregate middleware
exports.calcAttendance = catchAsync(async (req, res, next) => {
    const userId = req.student._id; // Assuming user is authenticated and available in req
    const subjectId = req.params.subjectId; // Assuming you have the subject ID in the request params

    const subjectData = await Subject.findById(subjectId);
    const totalDays = subjectData.totalNumLecture;
    const attendance = await Subject.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(subjectId), // Match the specific subject by its ID
                user: new mongoose.Types.ObjectId(userId), // Match the specific user by their ID
            },
        },

        {
            $unwind: '$attendanceRecords', // Unwind the attendanceRecords array
        },
        {
            $group: {
                _id: null,
                totalNumOfLecture: { $first: totalDays }, // Get the total days
                DayPassed: { $sum: 1 },
                presentDays: {
                    $sum: { $cond: ['$attendanceRecords.isPresent', 1, 0] },
                }, // Count present days
                absentDays: {
                    $sum: {
                        $cond: [
                            { $eq: ['$attendanceRecords.isPresent', false] },
                            1,
                            0,
                        ],
                    },
                }, // Count absent days
                holidayDays: {
                    $sum: { $cond: ['$attendanceRecords.holiday', 1, 0] },
                }, // Count holiday days
            },
        },

        {
            $project: {
                _id: 0, // Exclude _id field
                totalNumOfLecture: 1,
                DayPassed: 1,
                presentDays: 1,
                absentDays: 1,
                holidayDays: 1,
                remainingDays: {
                    $subtract: ['$totalNumOfLecture', '$DayPassed'],
                }, // Calculate absent days
                attendancePercent: {
                    $round: [
                        {
                            $multiply: [
                                {
                                    $divide: ['$presentDays', '$DayPassed'],
                                },
                                100,
                            ],
                        },
                        2,
                    ],
                },
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            attendance: attendance[0], // Assuming there's only one subject/user combination
        },
    });
});
