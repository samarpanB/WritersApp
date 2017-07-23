'use strict';
// Load required packages
let User = require('./userModel');
// let mailer = require('../mailer/mailerController');
let UserType = require('../../../common/enums/userTypes').UserType;
let UserStatuses = require('../../../common/enums/userStatuses').UserStatusEnum;
let UserStatus = require('../../../common/enums/userStatuses').UserStatus;
let EmailType = require('../../../common/enums/emailTypes').EmailType;
let SignUpUser = require('../signUpUser/signUpUserModel');
let tenantController = require('../tenant/tenantController');

// let sendInviteEmail = function(req, res, next) {
//     if(!req.body.email) {
//         next();
//     }

//     let mailReq = {
//         body: {
//             from: process.env.MAILER_GMAIL_USER,
//             to: req.body.email,
//             subject: "User invite !",
//             html: "Welcome to Writers World !",
//             type: EmailType.UserInvite
//         }
//     };
//     mailer.sendMail(mailReq, res, next);
// }

let getById = exports.getById = function (req, res, next, id) {
    User.findOne({_id: id, status: UserStatus.Active}, '-password').populate('tenant').exec(function(err, result) { 
        if(!err && result) {
            req.__orig = result;
            next();
        } else {
            err = new Error("User not found !");
            err.status = 404;
            next(err);
        }
    });
};

let getByUsername = exports.getByUsername = function (req, res, next, username) {
    // If tenant id available from header, search within that tenant
    User.findOne({
        username: username,
        tenant: req.get("tenant_id"),
        status: UserStatus.Active
    }, '-password')
    .populate('tenant').exec(function(err, result) { 
        if(!err && result) {
            req.__orig = result;
            next();
        } else {
            next(err);
        }
    });
};

let isUserTenantValid = exports.isUserTenantValid = function(req, res, next) {
    // If tenant id available from header, search within that tenant
    if (req.get("tenant_id") && req.user) {
        getByUsername(req, res, function (err) {
            if (!err) {
                req.user = req.__orig;
                next();
            } else {
                let err = new Error("User forbidden to access this resource from this tenant !");
                err.status = 403;
                next(err);
            }
        }, req.user.username);
    } else {
        let err = new Error("User forbidden to access this resource from this tenant !");
        err.status = 403;
        next(err);
    }
};

let isSuperAdmin = exports.isSuperAdmin = function(req, res, next) {
    if (req.user && req.user.type === UserType.SuperAdmin) {
        next();
    } else {
        let err = new Error("User forbidden to access this resource from this tenant !");
        err.status = 403;
        next(err);
    }
};

exports.post = function(req, res, next) {
    let user = new User(req.body);
    user.tenant = user.tenant || req.get("tenant_id");
    user.save(function(err, result){
        if(!err) {
            // sendInviteEmail(req, res, function () {
                res.send(result);
            // });
        }
        else if(err.message.indexOf("duplicate key error") >= 0) {
            res.status(400).send(err);
        }
        else {
            next(err);
        }
    });
};

exports.registerUser = function(req, res, next) {
    SignUpUser.findOne({token: req.body.token}, function(err, result) {
        if (!err) {
            req.body.firstName = result.firstName;
            req.body.lastName = result.lastName;
            req.body.username = result.username;
            req.body.email = result.email;
            req.body.type = result.type;
            req.body.isDefault = true;
            tenantController.getByName(req, res, function(err) {
                if (!err) {
                    req.body.tenant = req.__orig.id;
                }
                next();
            }, "AppInstance");
        } else {
            next(err);
        }
    });
}

exports.get = function(req, res, next) {
    User.paginate({status: UserStatus.Active}, { 
        page: parseInt(req.query.page), 
        limit: parseInt(req.query.limit),
        populate: [
            {
                path: 'tenant'
            }
        ],
        select: "-password"
    }, function(err, records, pageCount, itemCount) {
        if(!err) {
            res.send({
                records: records.docs,
                totalRecords: records.total
            });
        }
        else {
            next(err);
        }
    
    });
};

exports.getTenants = function(req, res, next) {
    User.find({
        username: req.__orig.username,
        status: UserStatus.Active
    }, "tenant").populate('tenant').exec(function(err, result) {
        let resultArr = [];
        if(!err) {
            resultArr = result.map(function (r) {
                return r.tenant;
            })
            res.send(resultArr);
        }
        else {
            next(err);
        }
    });
};

exports.getLoggedInUser = function(req, res, next) {
    if (req.user) {
        if (req.get("tenant_id")) {
            getByUsername(req, res, function (err) {
                if (!err) {
                    res.send(req.__orig);
                } else {
                    next(err);
                }
            }, req.user.username);
        } else {
            // Return the authenticated user from bearer token
            req.__orig = req.user;
            res.send(req.__orig);
        }  
    } else {
        err = new Error("User not found !");
        err.status = 404;
        next(err);
    }
};

exports.put = function(req, res, next) {
    let user = new User(req.body);
    req.__orig.merge(user);
    req.__orig.save(function(err, u){
        if(!err) {
            res.send(u);
        }
        else if(err.message.indexOf("duplicate key error") >= 0) {
            res.status(400).send(err);
        }
        else {
            next(err);
        }
    });
};

exports.changeStatus = function(req, res, next) {
    let user = req.__orig;
    if(user) {
        // Return immediately if invalid status found
        if(UserStatuses.indexOf(req.body.status) < 0) {
            let err = new Error('Invalid request !');
            err.status = 400;
            return next(err);
        }

        User.update({_id: user.id}, {status: req.body.status}, function(err, result) {
            if(!err) {
                res.send({
                    message: "User status updated successfully"
                });
            }
            else if(err.message.indexOf("duplicate key error") >= 0) {
                res.status(400).send(err);
            }
            else {
                next(err);
            }
        });
    }
};

exports.delete = function(req, res, next) {
    let user = req.__orig;
    User.update({_id: user.id}, { status: UserStatus.Deleted, isDeleted: true }, function (err, result) {
        if(!err) {
            res.send({
                message: "User removed successfully"
            });
        }
        else if(err.message.indexOf("duplicate key error") >= 0) {
            res.status(400).send(err);
        }
        else {
            next(err);
        }
    });
};

exports.hardDelete = function(req, res, next) {
    let user = req.__orig;
    User.remove({_id: user.id}, function(err, result){
        if(!err) {
            res.send({
                message: "User removed permanently"
            });
        }
        else if(err.message.indexOf("duplicate key error") >= 0) {
            res.status(400).send(err);
        }
        else {
            next(err);
        }
    });
};