const express = require('express');
const subjectController = require('../controller/subjectController');
const authController = require('../controller/authController');
const router = express.Router({ mergeParams: true });

router.route('/getAllData').get(subjectController.getAllStudent);

router.use(authController.protect);
router.route('/addSubject').post(subjectController.createNewSubject);
router
    .route('/markAttendance/:subjectId')
    .post(subjectController.markAttendance);
router.get('/dashboard', subjectController.getUserSubjectsAndAttendance);

router
    .route('/calcAttendance/:subjectId')
    .get(authController.protect, subjectController.calcAttendance);

//Updating
router
    .route('/updateSubjectData/:subjectId/:date')
    .patch(authController.protect, subjectController.updateSubjectDetails);

router
    .route('/deleteSubject/:subjectId')
    .delete(authController.protect, subjectController.deleteSubject);

router
    .route('/deleteAttendance/:subjectId/:attendanceDate')
    .delete(authController.protect, subjectController.deleteAttendance);

module.exports = router;
