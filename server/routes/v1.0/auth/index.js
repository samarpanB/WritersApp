var express = require('express');
var router = express.Router();
var controller = require('./authController');
var oauthController = require('./oauth2Controller');
var webClient = require('../../../common/constants/appConstants').webClient;

// Login route
var route = router.route('/login');
route.post(function(req, res, next){
		req.body.grant_type = "password";
		next();
	},
	controller.isAuthenticated, 
	oauthController.token
);

// Extend session route
route = router.route('/extendsession');
route.post(function(req, res, next){
		req.body.grant_type = "refresh_token";
		req.body.refresh_token = req.body.refreshToken;
		next();
	},
	controller.isAuthenticated, 
	oauthController.token
);

// Logout route
route = router.route('/logout');
route.post(
	controller.isBearerAuthenticated, 
	controller.logout
);

module.exports = router;