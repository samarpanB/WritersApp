"use strict";
// Load required packages
require('../user/userModel');
let commentSchema = require('./comment/commentModel');
let mongoose = require('mongoose');
let merge = require('mongoose-merge-plugin');
let defSchemaAttr = require('../../../common/plugins/defaultSchemaAttr');
let mongoosePaginate = require('mongoose-paginate');
let db = require('../../../connections/dbGeneral');
let statuses = require('./jobStatuses');

mongoose.plugin(merge);

// Define our job schema
let JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    content: {
        type: String
    },
    status: {
        type: String,
        enum: statuses.JobStatusEnum
    },
    comments: [
        commentSchema
    ],
    // User mapped from User model
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
        mergeable: false
    },
    // User mapped from User model
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        sparse: true,
        mergeable: false
    }
},
{
    minimize: false
});

JobSchema.pre('save', function(callback) {
    let job = this;

    job.status = statuses.JobStatus.Active;
    callback();
});


// Add paginate plugin
JobSchema.plugin(mongoosePaginate);
// Add default schema attributes plugin
JobSchema.plugin(defSchemaAttr);

// Export the Mongoose model
module.exports = db.model('Job', JobSchema);