"use strict";
// Load required packages
let mongoose = require('mongoose');
let merge = require('mongoose-merge-plugin');
let defSchemaAttr = require('../../../common/plugins/defaultSchemaAttr');
let mongoosePaginate = require('mongoose-paginate');
let db = require('../../../connections/dbGeneral');
let utils = require('../../../common/utils/appUtils');
let types = require('../../../common/enums/userTypes');

mongoose.plugin(merge);

// Define our signUpUser schema
let SignUpUserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: types.UserTypeEnum,
        required: true
    },
    token: {
        type: String,
        unique: true
    },
    expiryDate: {
        type: Date
    }
},
{
    minimize: false
});
SignUpUserSchema.index({firstName : 1, lastName: 1}, {sparse: true});
SignUpUserSchema.index({username: 1, email : 1}, {unique: true});

SignUpUserSchema.pre('save', function(callback) {
    let signUpUser = this;

    // Generate unique token
    let tokenValue = utils.uid(32);
    signUpUser.token = tokenValue;

    // 30 days validity period for token
    signUpUser.expiryDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
    callback();
});


// Add paginate plugin
SignUpUserSchema.plugin(mongoosePaginate);
// Add default schema attributes plugin
SignUpUserSchema.plugin(defSchemaAttr);

// Export the Mongoose model
module.exports = db.model('SignUpUser', SignUpUserSchema);