const multer = require('multer');
const sharp = require('sharp');
const studentModel = require('../model/studentModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const errorController = require('./errorController');
const Student = require('../model/studentModel');

//creating multer storage
const multerStorage = multer.memoryStorage();

//check user upload the image

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an Image! Please Upload only images.', 400));
    }
};

//upload image

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadStudentPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.student.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
    //1) create error if user post password data
    if (req.body.password || req.body.confirmPassword) {
        return next(
            new AppError(
                'This route is not for password update.Please use /updatePassword',
                404
            )
        );
    }

    // 2) get the photo
    let photo;
    if (req.file) {
        photo = req.file.filename;
    }

    //3) Update User document

    const updateData = await Student.findByIdAndUpdate(
        req.student.id,
        {
            name: req.body.name,
            email: req.body.email,
            photo,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    //4) render it
    res.status(200).json({
        status: 'success',
        message: 'Data Modified',
        data: {
            user: updateData,
        },
    });
});
