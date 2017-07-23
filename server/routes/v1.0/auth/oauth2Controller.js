'use strict';
// Load required packages
let oauth2orize = require('oauth2orize');
let async = require("async");
let User = require('../user/userModel');
let Client = require('./authClientModel');
let AccessTokenModel = require('./accessTokenModel');
let RefreshTokenModel = require('./refreshTokenModel');
let UserStatus = require('../../../common/enums/userStatuses').UserStatus;
let config = require('../../../config');

// Create OAuth 2.0 server
let server = oauth2orize.createServer();

// Exchange username & password for an access token.
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    User.findOne({
        username: username,
        isDefault: true
    }, function(err, user) {
        if (err) { 
            return done(err); 
        }
        if (!user || [UserStatus.Active].indexOf(user.status) < 0) {
            let er = new Error("User inactive or does not exist !");
            er.status = 401;
            return done(er);
        }

        let tokenValue = uid(32);
        let refreshTokenValue = uid(32);
        let token = new AccessTokenModel({ 
            token: tokenValue, 
            clientId: client.id, 
            userId: user.id
        });
        let refreshToken = new RefreshTokenModel({ 
            token: refreshTokenValue, 
            clientId: client.id, 
            userId: user.id 
        });

        async.series([
            function(cb) {
                user.verifyPassword(password, function(err, isMatch) { 
                    if(err) return cb(err); 
                    if(!isMatch) { 
                        let er = new Error("Username password mismatch !");
                        er.status = 401;
                        return cb(er); 
                    }
                    cb();
                });
            },
            function(cb) {
                async.parallel([
                    function(cbInner) {
                        RefreshTokenModel.remove({ userId: user.id, clientId: client.id }, function (err) {
                            if (err) return cbInner(err);
                            cbInner();
                        });
                    },
                    function(cbInner) {
                        AccessTokenModel.remove({ userId: user.id, clientId: client.id }, function (err) {
                            if (err) return cbInner(err);
                            cbInner();
                        });
                    }
                ], function(err){
                    cb(err);
                });
            },
            function(cb) {
                async.parallel([
                    function(cbInner) {
                        refreshToken.save(function (err) {
                            if (err) { return cbInner(err); }
                            cbInner();
                        });
                    },
                    function(cbInner) {
                        token.save(function (err, token) {
                            if (err) { return done(err); }
                            cbInner();
                        });
                    }
                ], function(err){
                    cb(err);
                });
            }
        ], function(err) {
            if(err) {
                done(err);
            }
            else {
                done(null, tokenValue, refreshTokenValue, { 'expires_in': config.security.tokenLife });
            }
        });
    });
}));

// Exchange refreshToken for an access token.
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
    RefreshTokenModel.findOne({ token: refreshToken }, function(err, token) {
        if (err) { return done(err); }
        if (!token) { return done(null, false); }

        User.findById(token.userId, function(err, user) {
            if (err) { return done(err); }
            if (!user || [UserStatus.Active].indexOf(user.status) < 0) {
                let er = new Error("User inactive or does not exist !");
                er.status = 401;
                return done(er);
            }

            let tokenValue = uid(32);
            let refreshTokenValue = uid(32);
            let token = new AccessTokenModel({ 
                token: tokenValue, 
                clientId: client.id, 
                userId: user.id 
            });
            let refreshToken = new RefreshTokenModel({ 
                token: refreshTokenValue, 
                clientId: client.id, 
                userId: user.id 
            });

            async.series([
                function(cb) {
                    async.parallel([
                        function(cbInner) {
                            RefreshTokenModel.remove({ userId: user.id, clientId: client.id }, function (err) {
                                if (err) return cbInner(err);
                                cbInner();
                            });
                        },
                        function(cbInner) {
                            AccessTokenModel.remove({ userId: user.id, clientId: client.id }, function (err) {
                                if (err) return cbInner(err);
                                cbInner();
                            });
                        }
                    ], function(err){
                        cb(err);
                    });
                },
                function(cb) {
                    async.parallel([
                        function(cbInner) {
                            refreshToken.save(function (err) {
                                if (err) { return cbInner(err); }
                                cbInner();
                            });
                        },
                        function(cbInner) {
                            token.save(function (err, token) {
                                if (err) { return done(err); }
                                cbInner();
                            });
                        }
                    ], function(err){
                        cb(err);
                    });
                }
            ], function(err) {
                if(err) {
                    done(err);
                }
                else {
                    done(null, tokenValue, refreshTokenValue, { 'expires_in': config.security.tokenLife });
                }
            });
        });
    });
}));

// token endpoint
exports.token = [
    server.token(),
    server.errorHandler()
]

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
function uid (len) {
  let buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (let i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

