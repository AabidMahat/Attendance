const Subject = require('../model/subjectModel');
const Student = require('../model/studentModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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

exports.subjectOverview = catchAsync(async (req, res, next) => {
    console.log(req.student);
    console.log(res.student);

    const student = req.student.id;
    //FInd the subject for specific student
    const subjects = await Subject.find({ user: student });

    console.log(subjects);

    if (!subjects) {
        return next(new AppError('No Subject is being allocated 😒😒', 404));
    }

    res.status(200).render('overview', {
        title: 'Subject Overview',
        subjects,
    });
});

exports.addSubject = (req, res, next) => {
    res.status(200).render('addData');
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
