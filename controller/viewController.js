const Subject = require('../model/subjectModel');
const Student = require('../model/studentModel');
const AppError = require('../utils/appError');

exports.signUpStudent = (req, res, next) => {
    res.status(200).render('signUp', {
        title: 'Create New Account',
    });
};
