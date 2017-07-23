// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var User = require('../user/userModel');
var Client = require('./authClientModel');
var AccessToken = require('./accessTokenModel');
var RefreshToken = require('./refreshTokenModel');
var UserStatus = require('../../../common/enums/userStatuses').UserStatus;
var config = require('../../../config');
var Log = require('log'), log = new Log();

passport.use(new BasicStrategy(
    function(username, password, callback) {
        Client.findOne({ id: username }, function (err, client) {
            if (err) { 
                return callback(err); 
            }

            // No client found with that id or bad password
            if (!client || client.secret !== password) { 
                return callback(null, false, {message: "Client unauthorised !"}); 
            }

            // Success
            return callback(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, callback) {
        Client.findOne({ id: clientId }, function(err, client) {
            if (err) { 
                return callback(err); 
            }

            // No client found with that id or bad password
            if (!client || client.secret !== clientSecret) { 
                return callback(null, false, {message: "Client unauthorised !"}); 
            }

            // Success
            return callback(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, callback) {
        AccessToken.findOne({ token: accessToken }, function(err, token) {
            if (err) { 
                return callback(err); 
            }

            // No token found
            if (!token) { 
                return callback(null, false, {message: "User token invalid !"}); 
            }

            if( Math.round((Date.now()-token.created)/1000) > config.security.tokenLife ) {
                AccessToken.remove({ token: accessToken }, function (err) {
                    if (err) return callback(err);
                });
                return callback(null, false, { message: 'Token expired' });
            }

            User.findById(token.userId, function(err, user) {
                if (err) { 
                    return callback(err); 
                }
                // No user found
                if (!user || [UserStatus.Active].indexOf(user.status) < 0) { 
                    var er = new Error("User inactive or does not exist !");
                    er.status = 403;
                    return callback(er);
                }

                callback(null, user, { scope: '*' });
            });
        });
    }
));

exports.isAuthenticated = passport.authenticate(['basic', 'oauth2-client-password'], { session : false });

exports.isBearerAuthenticated = function(req, res, next) {
    passport.authenticate('bearer', { session: false }, function(err, user, info){
        // error occured
        if(err) {
            return next(err);
        }

        // token invalid
        if(!user) {
            // Identify error message
            // info looks like this - Bearer realm="Users", error="invalid_token", error_description="User token invalid !"
            var errMsg = info.replace(/"/g, "").split(",");
            errMsg = errMsg[errMsg.length-1].split("=");
            errMsg = errMsg[1];

            // Throw error
            var er = new Error(errMsg);
            er.status = 401;
            return next(er);
        }

        // All OK
        req.user = user;
        next();
    })(req, res, next);
};

exports.logout = function(req, res, next) {
    RefreshToken.remove({ userId: req.user.id, clientId: req.body.client_id }, function (err) {
        if (err) 
            log.error(err);
    });
    AccessToken.remove({ userId: req.user.id, clientId: req.body.client_id }, function (err) {
        if (err) 
            log.error(err);
    });
    req.logout();
    res.send({message: "User logged out successfully"});
};