// Load required packages
var Log = require('log'), log = new Log();
var nodemailer = require('nodemailer');
var Mailer = require('./mailerModel');
var EmailStatus = require('../../../common/enums/emailStatuses').EmailStatus;

// Configure transporter
var transporter = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: process.env.MAILER_GMAIL_USER,
        pass: process.env.MAILER_GMAIL_PASS
    }
});

// Send email....
exports.sendMail = function(req, res, next) {
    var emailType = req.body.type;
    delete req.body.type;
    
    transporter.sendMail(req.body, function(err, info){
        var updates = {
            message: req.body,
            response: err || info,
            status: EmailStatus.Pending,
            type: emailType
        };
        
        // Update status
        if(err) {
            updates.status = EmailStatus.Error;
        }
        else if(info.rejected && info.rejected.length > 0) {
            updates.status = EmailStatus.Rejected;
        }
        else if(info.pending && info.pending.length > 0) {
            updates.status = EmailStatus.Pending;
        }
        else {
            updates.status = EmailStatus.Accepted;
        }

        var mailer = new Mailer(updates);
        // Send update to DB
        mailer.save(function(err, result){
            if(err) {
                log.error(err);
            }
        });
    });
    next();
};