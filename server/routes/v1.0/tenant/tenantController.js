'use strict';
// Load required packages
let Tenant = require('./tenantModel');

// Create endpoint /api/tenants for POST
exports.post = function(req, res, next) {
    let tenant = new Tenant(req.body);
    tenant.save(function(err, result){
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

// Create endpoint /api/tenants for GET
exports.get = function(req, res, next) {
    Tenant.paginate({expired: false, isDeleted: false}, { 
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
    Tenant.findOne({_id: id, expired: false, isDeleted: false}, function(err, result) { 
        if(!err && result) {
            req.__orig = result;
            next();
        }
        else {
            err = new Error("Tenant not found !");
            err.status = 404;
            next(err);
        }
    });
};

exports.getByName = function(req,res, next, name) {
    Tenant.findOne({name: name, expired: false, isDeleted: false}, function(err, result) { 
        if(!err && result) {
            req.__orig = result;
            next();
        }
        else {
            err = new Error("Tenant not found !");
            err.status = 404;
            next(err);
        }
    });
};

exports.put = function(req, res, next) {
    let tenant = new Tenant(req.body);
    req.__orig.merge(tenant);
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
    let tenant = req.__orig;
    Tenant.update({_id: tenant.id}, { isDeleted: true }, function (err, result) {
        if(!err) {
            res.send({
                message: "Tenant removed successfully"
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
    let tenant = req.__orig;
    Tenant.remove({_id: tenant.id}, function(err, result){
        if(!err) {
            res.send({
                message: "Tenant removed permanently"
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