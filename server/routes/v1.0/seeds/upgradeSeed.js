var Log = require('log'), log = new Log();
var mongoose = require('mongoose'); 
var db = require('../../../connections/dbGeneral');
var count = 0;

var webClient = require('../../../common/constants/appConstants').webClient;
var ClientModel = require('../auth/authClientModel');
count++;
ClientModel.findOne({id: webClient.id}, function(err) {
	if(err) {
		var client = new ClientModel(webClient);
	    client.save(function(err, client) {
	        if(err) {
	        	log.error(err);
	        }
	        else {
	        	log.info(webClient.name + " created.");
	        }
	        count--;
	    });
	}
	else {
		count--;
	} 
});

// Timer to wait for all executions & then close db connection
var timer = setInterval(function() {
	if(count === 0) {
		clearInterval(timer);
		log.info("All done. Closing db connection now.");
		db.close();
	}
}, 1000);