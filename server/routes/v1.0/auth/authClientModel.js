// Load required packages
var mongoose = require('mongoose');
var db = require('../../../connections/dbGeneral');

// Define our client schema
var ClientSchema = new mongoose.Schema({
  	name: { type: String, unique: true, required: true },
  	id: { type: String, required: true },
  	secret: { type: String, unique: true, required: true }
});

// Export the Mongoose model
module.exports = db.model('AuthClient', ClientSchema);