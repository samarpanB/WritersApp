"use strict";
// Load required packages
let mongoose = require('mongoose');
let merge = require('mongoose-merge-plugin');
let defSchemaAttr = require('../../../../common/plugins/defaultSchemaAttr');
let mongoosePaginate = require('mongoose-paginate');
let db = require('../../../../connections/dbGeneral');
let statuses = require('./commentStatuses');

mongoose.plugin(merge);

// Define our comment schema
let CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: statuses.CommentStatusEnum
    },
    // Tenants mapped from Tenant model
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
        mergeable: false
    }
},
{
    minimize: false
});

CommentSchema.pre('save', function(callback) {
    let comment = this;

    comment.status = statuses.CommentStatus.New;
    callback();
});


// Add paginate plugin
CommentSchema.plugin(mongoosePaginate);
// Add default schema attributes plugin
CommentSchema.plugin(defSchemaAttr);

// Export the Mongoose schema
module.exports = CommentSchema;