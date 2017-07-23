var Log = require('log'), log = new Log();
// Bring Mongoose into the app 
var mongoose = require( 'mongoose' );
mongoose.Promise = global.Promise;

// Build the connection string 
var dbURI = require('../config').db.general;

// Create the database connection 
var db = mongoose.createConnection(dbURI); 

// CONNECTION EVENTS
// When successfully connected
db.on('connected', function () {  
  log.debug('Mongoose connection open to general DB - ' + dbURI);
}); 

// If the connection throws an error
db.on('error',function (err) {  
  log.debug('Mongoose connection error for general DB: ' + err);
}); 

// When the connection is disconnected
db.on('disconnected', function () {  
  log.debug('Mongoose connection disconnected for general DB'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  db.close(function () { 
    log.debug('Mongoose connection disconnected for general DB through app termination'); 
    process.exit(0); 
  }); 
});

module.exports = db;
