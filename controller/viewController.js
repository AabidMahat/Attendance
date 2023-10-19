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
