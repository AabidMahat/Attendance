const AppError = require('./../utils/appError');

const handleCastErrorDB = (err, id) => {
    const message = `No tour Found with this ${id}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue.name;

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const handleJWTError = () =>
    new AppError('Invalid Token. Please login again', 401);

const handleTokenExprieError = () =>
    new AppError('Your token has expired !', 401);

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        // 1) API
        if (req.originalUrl.startsWith('/api')) {
            return res.status(err.statusCode).json({
                status: err.status,
                error: err,
                message: err.message,
                stack: err.stack,
            });
        }
    }
    //2) Rendered Website
    console.error('ERROR 💥', err);

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
    // Operational, trusted error: send message to client
    // 1) API
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });

            // Programming or other unknown error: don't leak error details
        } else {
            // 1) Log error
            console.error('ERROR 💥', err);

            // 2) Send generic message
            return res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
    // 2) Rendered Website

    // B) RENDERED WEBSITE
    // A) Operational, trusted error: send message to client
    console.error('ERROR 💥', err);

    if (err.isOperational) {
        console.log(err);
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message,
        });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.',
    });
};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    }
};
