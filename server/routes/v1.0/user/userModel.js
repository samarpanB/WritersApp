// Load required packages
require('../tenant/tenantModel');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var merge = require('mongoose-merge-plugin');
var types = require('../../../common/enums/userTypes');
var UserStatuses = require('../../../common/enums/userStatuses');
var defSchemaAttr = require('../../../common/plugins/defaultSchemaAttr');
var mongoosePaginate = require('mongoose-paginate');
var db = require('../../../connections/dbGeneral');

mongoose.plugin(merge);

// Define our user schema
var UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: types.UserTypeEnum,
        required: true
    },
    status: {
        type: String,
        enum: UserStatuses.UserStatusEnum
    },
    // In case user is part of multi tenant, this property will be set to true for the tenant which is default
    isDefault: {
        type: Boolean,
        default: false
    },
    // Tenants mapped from Tenant model
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true,
        index: true,
        mergeable: false
    }
},
{
    minimize: false
});
UserSchema.index({firstName : 1, lastName: 1}, {sparse: true});
UserSchema.index({username: 1, password : 1}, {unique: true});
UserSchema.index({username : 1, tenant: 1, status: 1}, {unique: true});

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
    var user = this;

    if (!user.type || types.UserTypeEnum.indexOf(user.type) === -1) {
        user.type = types.UserType.Customer;   // Set default enum value
    }

    if (!user.status || UserStatuses.UserStatusEnum.indexOf(user.status) === -1) {
        user.status = UserStatuses.UserStatus.Active;   // Set default enum value
    }

    // Break out if the password hasn't changed
    if (!user.isModified('password')) return callback();

    // Password changed so we need to hash it
    bcrypt.genSalt(5, function(err, salt) {
        if (err) return callback(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return callback(err);
            user.password = hash;
            callback();
        });
    });
});

UserSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// Add paginate plugin
UserSchema.plugin(mongoosePaginate);
// Add default schema attributes plugin
UserSchema.plugin(defSchemaAttr);

// Export the Mongoose model
module.exports = db.model('User', UserSchema);