'use strict';
// Load required packages
let SignUpUser = require('./signUpUserModel');

// Create endpoint /api/signUpUsers for POST
exports.post = function(req, res, next) {
    let signUpUser = new SignUpUser(req.body);
    signUpUser.save(function(err, result){
        if(!err) {
            res.send(result);
        }
        else if(err.message.indexOf("duplicate key error") >= 0) {
            res.status(400).send(err);
        }
        else {
            next(err);
        }
    });
};

// Create endpoint /api/signUpUsers for GET
exports.get = function(req, res, next) {
    SignUpUser.paginate({}, { 
        page: parseInt(req.query.page), 
        limit: parseInt(req.query.limit)
    }, function(err, records, pageCount, itemCount) {
        if(!err) {
            res.send({
                records: records,
                totalRecords: itemCount
            });
        }
        else {
            next(err);
        }
    
    });
};

let getById = exports.getById = function (req, res, next, id) {
    SignUpUser.findOne({_id: id}, function(err, result) { 
        if(!err && result) {
            req.__orig = result;
            next();
        }
        else {
            err = new Error("SignUpUser not found !");
            err.status = 404;
            next(err);
        }
    });
};

exports.getByToken = function (req, res, next, token) {
    SignUpUser.findOne({token: token}, function(err, result) { 
        if(!err && result) {
            req.__orig = result;
            next();
        }
        else {
            err = new Error("SignUpUser not found !");
            err.status = 404;
            next(err);
        }
    });
};

exports.put = function(req, res, next) {
    let signUpUser = new SignUpUser(req.body);
    req.__orig.merge(signUpUser);
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

exports.delete = function(req, res, next) {
    let signUpUser = req.__orig;
    SignUpUser.update({_id: signUpUser.id}, {isDeleted: true}, function (err, result) {
        if(!err) {
            res.send({
                message: "SignUpUser removed successfully"
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
    let signUpUser = req.__orig;
    SignUpUser.remove({_id: signUpUser.id}, function(err, result){
        if(!err) {
            res.send({
                message: "SignUpUser removed permanently"
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