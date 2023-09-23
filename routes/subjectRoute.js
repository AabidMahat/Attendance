const express = require('express');
const subjectController = require('../controller/subjectController');
const authController = require('../controller/authController');
const router = express.Router();
router.use(authController.protect);
router.route('/addSubject').post(subjectController.createNewSubject);
router
    .route('/markAttendance/:subjectId')
    .post(subjectController.markAttendance);
router.get('/dashboard', subjectController.getUserSubjectsAndAttendance);

router
    .route('/calcAttendance/:subjectId')
    .get(authController.protect, subjectController.calcAttendance);
module.exports = router;
