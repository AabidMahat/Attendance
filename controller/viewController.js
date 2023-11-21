const Subject = require('../model/subjectModel');
const Student = require('../model/studentModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.basePage = (req, res) => {
    res.status(200).render('index');
};

exports.signUpStudent = (req, res, next) => {
    res.status(200).render('signUp', {
        title: 'Create New Account',
    });
};
exports.loginStudent = (req, res, next) => {
    res.status(200).render('login', {
        title: 'Sign In ',
    });
};

const getTargetDate = (subjects, req, next) => {
    const targetDate = req.query.date ? new Date(req.query.date) : null; //Convert the date into Date object
    let attendance;
    if (targetDate) {
        attendance = subjects
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
                        Image: subject.Image,
                        totalNumLecture: subject.totalNumLecture,
                        attendancePercent: subject.attendancePercent,
                    };
                }
                // return next(
                //     new AppError('No attendance on that date 😅😅', 404)
                // );
                return null;
            })
            .filter(Boolean);

        if (!attendance) {
            return next(new AppError('No attendance on that date 😅😅', 404));
        }
    }
    return attendance;
};

exports.subjectOverview = catchAsync(async (req, res, next) => {
    const student = req.student.id;
    //FInd the subject for specific student
    const subjects = await Subject.find({ user: student });
    if (subjects.length === 0) {
        return res.redirect('/addSubject');
        // return next(new AppError('You have not enrolled any course yet!', 401));
    }

    if (req.query.date) {
        const result = getTargetDate(subjects, req, next);
        if (result.length === 0) {
            console.log('No result found');
            res.status(404).render('error', {
                msg: 'Attendance not found',
            });
        } else {
            console.log(result);

            res.status(200).render('overview', {
                title: 'Subject Overview',
                subjects: result,
            });
        }
    }

    res.status(200).render('overview', {
        title: 'Subject Overview',
        subjects,
    });
});

exports.addSubject = (req, res, next) => {
    res.status(200).render('addSubject');
};

exports.markAttendance = (req, res, next) => {
    res.status(200).render('markAttendance');
};

//account details

exports.getAccount = (req, res, next) => {
    res.status(200).render('account', {
        title: 'My Account',
    });
};

//update profile information

exports.updateStudentData = catchAsync(async (req, res, next) => {
    const updateStudent = await Student.findByIdAndUpdate(
        req.student.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).render('/account', {
        title: 'My Profile',
        student: updateStudent,
    });
});

exports.getAttendanceWithDates = catchAsync(async (req, res, next) => {
    const studentId = req.student.id;
    const subjectId = req.params.subjectId;

    const subjects = await Subject.findOne({
        user: studentId,
        _id: subjectId,
    });

    if (!subjects) {
        return next(new AppError('No subject Found 😥😥', 404));
    }
    console.log(subjects);

    res.status(200).render('attendanceDate', {
        title: 'Attendance Data',
        subjectData: subjects.attendanceRecords,
        subjects,
    });
});

exports.getCalender = catchAsync(async (req, res, next) => {
    const studentId = req.student.id;
    const subjectId = req.params.subjectId;

    const subjects = await Subject.findOne({
        user: studentId,
        _id: subjectId,
    });

    if (!subjects) {
        return next(new AppError('No subject Found 😥😥', 404));
    }
    // console.log(subjects);

    res.status(200).render('calender', {
        title: 'Attendance Data',
        subjectData: subjects.attendanceRecords,
        subjects,
    });
});

exports.getDateFromUser = (req, res, next) => {
    res.status(200).render('enterDate');
};

exports.updateSubjectData = catchAsync(async (req, res, next) => {
    const student = req.student.id;
    const subjectId = req.params.subjectId;
    const dateToUpdate = new Date(req.params.date);
    const subjectData = await Subject.findOne({
        _id: subjectId,
        user: student,
    });
    // Find the record in attendanceRecords with a matching date
    const recordToUpdate = subjectData.attendanceRecords.find((record) => {
        return record.date.toDateString() === dateToUpdate.toDateString();
    });

    if (!recordToUpdate) {
        return next(new AppError('Attendance not found 😥😥', 401));
    }
    console.log(recordToUpdate);
    res.status(200).render('updateAttendance', {
        title: 'Update Attendance Data',
        records: recordToUpdate,
        subjectData,
    });
});

exports.deleteSubject = async (req, res) => {
    const student = req.student.id;
    const subjectId = req.params.subjectId;

    const subjectData = await Subject.findOne({
        _id: subjectId,
        user: student,
    });
    res.status(200).render('delete', {
        subjects: subjectData,
    });
};
