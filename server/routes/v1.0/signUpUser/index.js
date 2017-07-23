var express = require('express');
var router = express.Router();
var controller = require('./signUpUserController');

// Routes
var route = router.route('/');
route.post(controller.post);

module.exports = router;