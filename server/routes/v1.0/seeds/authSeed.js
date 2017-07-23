var UserModel = require('../user/userModel');
var ClientModel = require('../auth/authClientModel');
var AccessTokenModel = require('../auth/accessTokenModel');
var RefreshTokenModel = require('../auth/refreshTokenModel');
var faker = require('faker');
var Log = require('log'), log = new Log();
var mongoose = require('mongoose'); 
var db = require('../../../connections/dbGeneral');
var webClient = require('../../../common/constants/appConstants').webClient;

UserModel.remove({}, function(err) {
    var user = new UserModel({ 
        username: "admin", 
        password: "mdsadmin",
        type: "Admin"
    });
    user.save(function(err, user) {
        if(err) return log.error(err);
    });

    // for(i=0; i<4; i++) {
    //     var user = new UserModel({ username: faker.random.first_name().toLowerCase(), password: faker.Lorem.words(1)[0] });
    //     user.save(function(err, user) {
    //         if(err) return log.error(err);
    //         else log.info("New user - %s:%s",user.username,user.password);
    //     });
    // }
});

ClientModel.remove({}, function(err) {
    var client = new ClientModel(webClient);
    client.save(function(err, client) {
        if(err) return log.error(err);
    });
});
AccessTokenModel.remove({}, function (err) {
    if (err) return log.error(err);
});
RefreshTokenModel.remove({}, function (err) {
    if (err) return log.error(err);
});

setTimeout(function() {
    db.close();
}, 3000);