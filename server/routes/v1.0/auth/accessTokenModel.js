// Load required packages
var mongoose = require('mongoose');
var db = require('../../../connections/dbGeneral');

// Define our token schema
var AccessTokenSchema   = new mongoose.Schema({
  	token: { 
  		type: String, 
  		unique: true,
  		required: true 
  	},
  	userId: { 
  		type: String, 
  		required: true 
  	},
  	clientId: { 
  		type: String, 
  		required: true 
  	},
    created: {
        type: Date,
        default: Date.now
    }
});

// Export the Mongoose model
module.exports = db.model('AccessToken', AccessTokenSchema);