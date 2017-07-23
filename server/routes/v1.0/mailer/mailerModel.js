// Load required packages
var mongoose = require('mongoose');
var merge = require('mongoose-merge-plugin');
var types = require('../../../common/enums/emailTypes');
var statuses = require('../../../common/enums/emailStatuses');
var defSchemaAttr = require('../../../common/plugins/defaultSchemaAttr');
var db = require('../../../connections/dbGeneral');

mongoose.plugin(merge);

// Define our mailer schema
var MailerSchema = new mongoose.Schema({
    message: {},
    response: {},
    status: {
        type: String,
        enum: statuses.EmailStatusEnum
    },
    type: {
        type: String,
        enum: types.EmailTypeEnum
    }
},
{
    minimize: false
});

// Execute before each mailer.save() call
MailerSchema.pre('save', function(callback) {
    var mailer = this;

    if(!mailer.type || types.EmailTypeEnum.indexOf(mailer.type) === -1) {
        mailer.type = types[0];   // Set default enum value
    }

    if(!mailer.status || statuses.EmailStatusEnum.indexOf(mailer.status) === -1) {
        mailer.status = statuses[0];   // Set default enum value
    }

    callback();
});

// Add default schema attributes plugin
MailerSchema.plugin(defSchemaAttr);

// Export the Mongoose model
module.exports = db.model('Mailer', MailerSchema);