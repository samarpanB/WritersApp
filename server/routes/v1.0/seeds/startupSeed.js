"use strict";

let UserModel = require('../user/userModel');
let TenantModel = require('../tenant/tenantModel');
let ClientModel = require('../auth/authClientModel');
let AccessTokenModel = require('../auth/accessTokenModel');
let RefreshTokenModel = require('../auth/refreshTokenModel');
let Log = require('log'), log = new Log();
let mongoose = require('mongoose'); 
let db = require('../../../connections/dbGeneral');
let webClient = require('../../../common/constants/appConstants').webClient;
let UserType = require('../../../common/enums/userTypes').UserType;
let LicenseType = require('../../../common/enums/licenseTypes').LicenseType;
let async = require("async");

async.parallel([
    function(cb) {
        let userTenantSave = async.compose(
            function (data, cb) {
                UserModel.remove({}, function(err) {
                    let user = new UserModel({
                        firstName: "Super",
                        lastName: "Admin",
                        email: "superadmin@writers.com",
                        username: "superadmin", 
                        password: "test@123",
                        type: UserType.SuperAdmin,
                        status: "Active",
                        isDefault: true,
                        tenant: data._id
                    });
                    user.save(function(err, user) {
                        if(err) {
                            log.error(err);
                            return cb();
                        }
                        log.info(user.username + " user created.");
                        cb(null, user);
                    });
                });
            },
            function (data, cb) {
                TenantModel.remove({}, function(err) {
                    let tenant = new TenantModel({
                        name: "AppInstance",
                        primaryContact: "superadmin@writers.com",
                        license: LicenseType.Permanent
                    });
                    tenant.save(function (err, t) {
                        if(err) {
                            log.error(err);
                            return cb();
                        }
                        log.info(t.name + " tenant created.");
                        cb(null, t);
                    });
                });
            }
        );
        userTenantSave(null, function() {
            cb();
        });
    },
    function(cb) {
        ClientModel.remove({}, function(err) {
            let client = new ClientModel(webClient);
            client.save(function(err, client) {
                if(err) {
                    log.error(err);
                    return cb();
                }
                log.info(webClient.name + " client created.");
                cb();
            });
        });
    },
    function(cb) {
        AccessTokenModel.remove({}, function (err) {
            cb();
        });
    },
    function(cb) {
        RefreshTokenModel.remove({}, function (err) {
            cb();
        });
    }
], function() {
    db.close();
    log.info("All done. Closing db connection now.");
});