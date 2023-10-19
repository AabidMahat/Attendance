const express = require('express');
const authController = require('../controller/authController');
const viewsController = require('../controller/viewController');

const router = express.Router();

router.route('/signUp').get(viewsController.signUpStudent);
router.route('/logIn').get(viewsController.loginStudent);

router
    .route('/subjectsOverview')
    .get(authController.isLogin, viewsController.subjectOverview);

router.route('/add').get(authController.isLogin, viewsController.addSubject);

router
    .route('/markAttendance/:subjectId')
    .get(authController.isLogin, viewsController.markAttendance);

module.exports = router;
