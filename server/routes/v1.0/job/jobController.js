'use strict';
// Load required packages
let Job = require('./jobModel');
let statuses = require('./jobStatuses');

// Create endpoint /api/jobs for POST
exports.post = function(req, res, next) {
    let job = new Job(req.body);
    job.owner = req.user;
    job.save(function(err, result){
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

// Create endpoint /api/jobs for GET
exports.get = function(req, res, next) {
    req.search = {
        isDeleted: false,
        $or: [
            {
                owner: req.user
            },
            {
                assignee: req.user
            }
        ]
    };
    Job.paginate(req.search, { 
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
    req.search = {
        isDeleted: false,
        _id: id,
        $or: [
            {
                owner: req.user
            },
            {
                assignee: req.user
            }
        ]
    };

    Job.findOne(req.search, function(err, result) { 
        if(!err && result) {
            req.__orig = result;
            next();
        }
        else {
            err = new Error("Job not found !");
            err.status = 404;
            next(err);
        }
    });
};

exports.put = function(req, res, next) {
    let job = new Job(req.body);
    req.__orig.merge(job);
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
    let job = req.__orig;
    if(job) {
        // Return immediately if invalid status found
        if(statuses.JobStatusEnum.indexOf(req.body.status) < 0) {
            let err = new Error('Invalid request !');
            err.status = 400;
            return next(err);
        }

        Job.update({_id: job.id}, {status: req.body.status}, function(err, result) {
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
    let job = req.__orig;
    Job.update({_id: job.id}, { isDeleted: true }, function (err, result) {
        if(!err) {
            res.send({
                message: "Job removed successfully"
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
    let job = req.__orig;
    Job.remove({_id: job.id}, function(err, result){
        if(!err) {
            res.send({
                message: "Job removed permanently"
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