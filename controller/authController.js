const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const studentModel = require('../model/studentModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const errorController = require('./errorController');
const { decode } = require('punycode');

const Email = require('../utils/email');
const Student = require('../model/studentModel');
const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECERT, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.logIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Enter email or password😒😒', 400));
    }
    //Finding the student
    const student = await studentModel.findOne({ email }).select('+password');

    //Matching the password

    if (
        !student ||
        !(await student.correctPassword(password, student.password))
    ) {
        return next(new AppError('Incorrect Email or Password 🤨🤨', 401));
    }
    // send the jwt token to client
    const token = signToken(student._id);

    //Sending the response

    res.status(200).json({
        status: 'Success',
        token,
        data: {
            student,
        },
    });
});

exports.sighUp = catchAsync(async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    // 1) Check whether user exist or not with given email

    const existingStudent = await studentModel.findOne({ email });

    if (existingStudent && !existingStudent.emailVerified) {
        return next(
            new AppError(
                'Account Already exists with this email  please verify ur email😑😑',
                401
            )
        );
    }

    //2) Create a new student

    const newStudent = await studentModel.create({
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        passwordChangeAt: Date.now(),
    });

    const token = signToken(newStudent._id);

    newStudent.verificationToken = token;
    await newStudent.save(); //Save the updated record

    try {
        const url = `http://127.0.0.1:3000/api/v2/student/verify/${token}`;

        await new Email(newStudent.email, url).signUpUser();

        res.status(200).json({
            status: 'Success',
            message: 'Mail send the your inbox',
        });
    } catch (err) {
        return next(
            new AppError(
                'Cannot send mail right, now due to some internal error!!😥😥',
                500
            )
        );
    }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
    const verifyToken = req.params.verifyToken;

    //1) Check whether student still exist with verification Token
    const student = await studentModel.findOne({
        verificationToken: verifyToken,
    });

    if (!student) {
        return next(
            new AppError('Verification failed!! Invalid token🤯🤯', 402)
        );
    }

    student.verificationToken = undefined;
    student.emailVerified = true;

    await student.save();

    res.status(200).json({
        status: 'Success',
        message: 'Email Verified successfully. You can logIn now 😄😄',
    });
});
exports.protect = catchAsync(async (req, res, next) => {
    let token;

    res.setHeader('Content-Type', 'application/javascript');

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged In 😡😡', 401));
    }

    //2) Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECERT);
    console.log(decoded);
    //3) Check if User still exists
    const freshStudent = await studentModel.findById(decoded.id);

    if (!freshStudent) {
        return next(new AppError('User is no longer Exist 🥲🥲', 401));
    }

    //4) Check if user changed password after the token has issued
    if (freshStudent.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'U have changed the password !! Please logIn again 😄😄',
                401
            )
        );
    }
    //Grant access to protected route;

    //putting all data to req
    req.student = freshStudent;
    next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
    //1) Find user with email
    const student = await Student.findOne({ email: req.body.email });

    if (!student)
        return next(
            new AppError(
                'No User with this mail !! Please check your mail🤯🤯',
                404
            )
        );

    //2) Generate random reset token

    const resetToken = student.createPasswordResetToken();

    try {
        const url = `http://127.0.0.1:3000/api/v2/student/resetPassword/${resetToken}`;

        await new Email(student.email, url).resetPassword();

        res.status(200).json({
            status: 'Success',
            message: 'Mail send the your inbox',
        });
    } catch (err) {
        return next(
            new AppError(
                'Cannot send mail right, now due to some internal error!!😥😥',
                500
            )
        );
    }

    await student.save({ validateBeforeSave: false });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) Get user from token

    const hashToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const student = await Student.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: {
            $gt: Date.now(),
        },
    });

    //2) If token is not expired or if there student exist set the new password

    if (!student) {
        return next(new AppError('Token is invalid or has expired😡😡😡', 400));
    }

    //3) Update the password

    student.password = req.body.password;
    student.confirmPassword = req.body.confirmPassword;

    student.passwordResetToken = undefined;
    student.passwordResetExpires = undefined;

    await student.save();

    const token = signToken(student._id);

    //4) Login the user

    res.status(200).json({
        status: 'Success',
        token,
        data: {
            student,
        },
    });
});
