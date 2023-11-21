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
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    //Creating cookies with jwt token
    const cookieOption = {
        expires: new Date(
            Date.now() +
                process.env.JWT_COOKIE_EXPIRES_IN * (24 * 60 * 60 * 1000)
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        cookieOption.secure = true;
    }
    res.cookie('jwt', token, cookieOption);

    //Remove the password from client
    user.password = undefined;

    // console.log(user);
    res.status(statusCode).json({
        status: statusCode,
        message: 'User logged In',
        token,
        data: {
            user,
        },
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
    createSendToken(student, 200, res);
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
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        // res.status(401).render('error', {
        //     msg: 'You are not logged In 😡😡',
        // });
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
    res.locals.student = freshStudent;
    next();
});

//Use isLogin function in frontend
exports.isLogin = async (req, res, next) => {
    let token;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // if (!token) {
    //     return next(new AppError('Ur not logged In 😡😡😡', 401));
    // }

    if (!token) {
        res.status(401).render('error', {
            msg: 'Ur not logged In 😡😡',
        });
        return;
    }

    try {
        //Creating a decoded Id
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECERT
        );

        console.log(decoded);

        const currentStudent = await studentModel.findById(decoded.id);

        if (!currentStudent) {
            return next(new AppError('User no longer exists 😥😥', 401));
        }

        if (currentStudent.changedPasswordAfter(decoded.iat)) {
            return next(
                new AppError(
                    'U have changed the password !! Please logIn again 😄😄',
                    401
                )
            );
        }

        req.student = currentStudent;
        res.locals.student = currentStudent;
        next();
    } catch (err) {
        res.status(401).render('error', {
            msg: 'Ur not logged In 😡😡',
        });
        return;
    }
};
// Check if the token exists in cookies

exports.forgetPassword = catchAsync(async (req, res, next) => {
    //1) Find user with email
    const student = await studentModel.findOne({ email: req.body.email });

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

    const student = await studentModel.findOne({
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

    await student.save({ validateBeforeSave: true });

    // const token = signToken(student._id);
    createSendToken(student, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) Get the user from collection
    console.log(req.student._id);
    const currentStudent = await Student.findById({
        _id: req.student._id,
    }).select('+password');

    if (!currentStudent)
        return next(new AppError('Ur not logged in Please login 😕😕', 404));

    const enteredPassword = req.body.currentPassword;

    console.log(enteredPassword);

    if (
        !(await currentStudent.correctPassword(
            enteredPassword,
            currentStudent.password
        ))
    ) {
        return next(
            new AppError('User not found . Please check ur password 😒😒', 401)
        );
    }

    // update the password

    currentStudent.password = req.body.password;
    currentStudent.confirmPassword = req.body.confirmPassword;

    await currentStudent.save();

    // login the user send the jwt token

    createSendToken(currentStudent, 200, res);
});

//Log Out Student

exports.logOut = (req, res) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 10 * 1000), //Delete cookie after 10s
        httpOnly: true,
    });
    res.status(200).json({
        status: 'Success',
    });
};
