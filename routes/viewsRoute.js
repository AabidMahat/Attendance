const express = require('express');
const authController = require('../controller/authController');
const viewsController = require('../controller/viewController');

const router = express.Router();

router.route('/signUp').get(viewsController.signUpStudent);

module.exports = router;
