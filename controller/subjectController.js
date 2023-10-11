const mongoose = require('mongoose');
const Subject = require('../model/subjectModel');
const Student = require('../model/studentModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const apiFeatures = require('../utils/ApiMethods');

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

        await Student.findByIdAndUpdate(userId, {
            $push: { subject: newSubject._id },
        });

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
            return res.status(404).json({
                status: 'error',
                message: 'Subject not found 😕',
            });
        }

        // Check if there's an existing attendance record
        let existingRecord = subject.attendanceRecords.find(
            (record) => record.date === date
        );

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

        // Save the document
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
        console.log(err);
    }
};

exports.getUserSubjectsAndAttendance = catchAsync(async (req, res, next) => {
    const userId = req.student._id;
    const subjects = await Subject.find({ user: userId });

    await Subject.populate(subjects, {
        path: 'attendanceRecords',
    });

    if (!subjects) {
        return next(new AppError('This user has no subject 😑😑', 404));
    }

    const targetDate = req.query.date ? new Date(req.query.date) : null; //Convert the date into Date object

    if (targetDate) {
        const attendance = subjects
            .map((subject) => {
                //filter the attendance record for that particular date
                const attendanceForDate = subject.attendanceRecords.filter(
                    (records) =>
                        records.date.toDateString() ===
                        targetDate.toDateString()
                );
                if (attendanceForDate.length > 0) {
                    return {
                        _id: subject._id,
                        subject: subject.subject,
                        user: subject.user,
                        attendanceRecords: attendanceForDate,
                    };
                }
                return null;
            })
            .filter(Boolean);

        if (!attendance) {
            return next(new AppError('No attendance on that date 😅😅', 404));
        }

        //Getting subject id

        res.status(200).json({
            status: 'Success',
            result: attendance.length,
            data: {
                attendance,
            },
        });
    } else {
        res.status(200).json({
            status: 'Success',
            result: subjects.length,
            data: {
                subjects,
            },
        });
    }
});

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

exports.getAllStudent = catchAsync(async (req, res, next) => {
    const queryObj = { ...req.query };

    const excludeData = ['page', 'sort', 'field', 'limit'];

    excludeData.forEach((el) => delete queryObj[el]);

    const student = await Student.find(queryObj);

    if (!student) return next(new AppError('Student Data not found 😥😥', 402));

    res.status(200).json({
        status: 'Success',
        result: student.length,
        data: {
            student,
        },
    });
});

exports.updateSubjectDetails = catchAsync(async (req, res, next) => {
    //1) Check if user is log
    const studentId = req.student.id;
    const subjectId = req.params.subjectId;
    const dateToModify = new Date(req.params.date);

    if (!studentId)
        return next(
            new AppError('Student is not logged In please Login 😒😒', 404)
        );
    //2) update the data
    const { subject, totalNumLecture, isPresent, holiday } = req.body;

    const findSubject = await Subject.findOne({ _id: subjectId });

    if (!findSubject)
        return next(
            new AppError('Student is not enrolled for this subject 😭😭', 404)
        );

    // Find the record in attendanceRecords with a matching date
    const recordToUpdate = findSubject.attendanceRecords.find((record) => {
        return record.date.toDateString() === dateToModify.toDateString();
    });

    if (recordToUpdate) {
        recordToUpdate.subject = subject;
        recordToUpdate.holiday = holiday;
        recordToUpdate.isPresent = isPresent;
        recordToUpdate.totalNumLecture = totalNumLecture;
    }
    console.log(recordToUpdate);

    await findSubject.save();
    //3) send the response

    res.status(200).json({
        status: 'success',
        message: 'Data updated successfully 😎😎',
        data: {
            findSubject,
        },
    });
});

exports.deleteSubject = catchAsync(async (req, res, next) => {
    // Check whether student login or not
    const studentId = req.student._id;
    const subjectId = req.params.subjectId;

    const subjects = await Subject.findByIdAndDelete(subjectId);

    if (!subjects) {
        return next(new AppError("There's no subject present😅😅", 400));
    }

    // Use $pull operator to remove the subjectId from the student's subjects array
    await Student.findByIdAndUpdate(studentId, {
        $pull: { subject: subjectId },
    });

    res.status(200).json({
        status: 'Success',
        message: 'Data deleted Successfully 😭😭',
    });
});

exports.deleteAttendance = catchAsync(async (req, res, next) => {
    // Check whether student login or not
    const subjectId = req.params.subjectId;

    const subject = await Subject.findOne({ _id: subjectId });

    //2) FInd the specific date and delete the attendance

    if (!subject) {
        return next(new AppError('Subject not found😕😕', 404));
    }

    const date = new Date(req.params.attendanceDate);

    subject.attendanceRecords = subject.attendanceRecords.filter(
        (record) => record.date.toDateString() !== date.toDateString()
    );

    await subject.save();

    res.status(200).json({
        status: 'Success',
        message: 'Attendance deleted Successfully 😭😭',
    });
});
