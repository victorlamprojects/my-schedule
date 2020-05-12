const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
const EmailList = require("../models/emailList.model");
const path = require('path');
const fs = require('fs');
let quotes = fs.readFileSync(path.join(__dirname, '../src/quotes_bank.txt')).toString().split('\n');

const uri = process.env.DB_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.once('open', ()=>{
	console.log("MongoDB connection established successfully.");
}).on('error', (err)=>{
	console.log('Error occurs while connecting to database...');
});
let sendQuotesToAll = async (sender, password, receiver)=>{
	let transporter = nodemailer.createTransport({
		service: 'gmail',
	  	auth: {
	    	user: sender,
	    	pass: password
	  	}
	});
	//new CronJob('0 0 12 * * *', function() {
		let quote = quotes[Math.floor(Math.random()*quotes.length)];
		let html_content = `<blockquote>
								<p>${quote.split(' - ')[0]}</p>
								<p style="text-align: right;">${quote.split(' - ')[1]}</p>
							</blockquote>
							<a style="text-align: center">Click here to cancel subscription.</a>
							`;
		var mailOptions = {
		  	from: sender,
		  	to: receiver,
			subject: 'Quote For Today',
	  		html: html_content
		};
		EmailList.find({}, (err, emails)=>{
			if(err){
				console.log(err);
				return;
			}
			if(emails != null && emails.length > 0){
				for(let i=0;i<emails.length;i++){
					mailOptions.to = emails[i].email;
					mailOptions.html = `<blockquote>
											<p>${quote.split(' - ')[0]}</p>
											<p style="text-align: right;">${quote.split(' - ')[1]}</p>
											</blockquote>
											<a style="text-align: center" href="https://victorlam-schedule.herokuapp.com/api/cancel_email/${emails[i].email}">Click here to cancel subscription.</a>
											`;
					transporter.sendMail(mailOptions, function(err, info){
					  	if (err) {
					   			console.log(err);
				  		} 
					  	else {
					    	console.log('Email sent: ' + info.response);
					  	}
					});
				}
			}
		});
	//}, null, true, 'Aisa/Hong_Kong');
}

sendQuotesToAll("victorlamprojects@gmail.com", "92018713");