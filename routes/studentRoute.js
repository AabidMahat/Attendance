const express = require('express');
const authController = require('../controller/authController');
const studentController = require('../controller/studentController');

const router = express.Router();

router.route('/signUp').post(authController.sighUp);
router.route('/verify/:verifyToken').get(authController.verifyEmail);
router.route('/logIn').post(authController.logIn);

router.route('/forgetPassword').post(authController.forgetPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router
    .route('/updateMe')
    .patch(
        authController.isLogin,
        studentController.uploadStudentPhoto,
        studentController.resizeUserPhoto,
        studentController.updateMe
    );

module.exports = router;
