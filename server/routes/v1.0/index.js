'use strict';

let express = require('express');
let router = express.Router();
let authController = require('./auth/authController');
let userController = require('./user/userController');

// Public facing APIs
router.use('/signup', require('./signUpUser/index'));
router.route('/register').post(userController.registerUser, userController.post);

// Auth route
router.use('/auth', require('./auth/index'));

// Auth check for all routes
router.use(authController.isBearerAuthenticated);
// Logged in user details route
router.route('/me').get(userController.getLoggedInUser);
// User route paths
router.use('/tenants', require('./tenant/index'));

// Tenant check for all further routes
router.use(userController.isUserTenantValid);
// User route paths
router.use('/users', require('./user/index'));
// Jobs route paths
router.use('/jobs', require('./job/index'));

module.exports = router;
