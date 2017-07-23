"use strict";
// Load required packages
let mongoose = require('mongoose');
let merge = require('mongoose-merge-plugin');
let defSchemaAttr = require('../../../common/plugins/defaultSchemaAttr');
let mongoosePaginate = require('mongoose-paginate');
let db = require('../../../connections/dbGeneral');
let licenseTypes = require('../../../common/enums/licenseTypes');

mongoose.plugin(merge);

// Define our tenant schema
let TenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    primaryContact: {
        type: String,
        required: true
    },
    license: {
        type: String,
        enum: licenseTypes.LicenseTypeEnum,
        required: true
    },
    configuration: {
        type: Object
    },
    expiryDate: {
        type: Date
    },
    expired: {
        type: Boolean,
        default: false
    }
},
{
    minimize: false
});

TenantSchema.pre('save', function(callback) {
    let tenant = this;

    if (!tenant.license || licenseTypes.LicenseTypeEnum.indexOf(tenant.license) === -1) {
        tenant.license = licenseTypes.LicenseType.Trial;   // Set default enum value
    }

    // 30 days trial period
    if (tenant.license === licenseTypes.LicenseType.Trial) {
        tenant.expiryDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
    }
    callback();
});


// Add paginate plugin
TenantSchema.plugin(mongoosePaginate);
// Add default schema attributes plugin
TenantSchema.plugin(defSchemaAttr);

// Export the Mongoose model
module.exports = db.model('Tenant', TenantSchema);