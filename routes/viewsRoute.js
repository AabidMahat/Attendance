const express = require('express');
const authController = require('../controller/authController');
const viewsController = require('../controller/viewController');

const router = express.Router();

router.route('/').get(viewsController.basePage);

router.route('/signUp').get(viewsController.signUpStudent);
router.route('/logIn').get(viewsController.loginStudent);

router
    .route('/subjectsOverview')
    .get(authController.isLogin, viewsController.subjectOverview);

router
    .route('/addSubject')
    .get(authController.isLogin, viewsController.addSubject);

router
    .route('/markAttendance/:subjectId')
    .get(authController.isLogin, viewsController.markAttendance);

router
    .route('/account')
    .get(authController.isLogin, viewsController.getAccount);

router
    .route('/getAttendanceWithDates/:subjectId')
    .get(authController.isLogin, viewsController.getCalender);

router
    .route('/updateAttendance/:subjectId/:date')
    .get(authController.isLogin, viewsController.updateSubjectData);

router
    .route('/deleteSubject/:subjectId')
    .get(authController.isLogin, viewsController.deleteSubject);

module.exports = router;
