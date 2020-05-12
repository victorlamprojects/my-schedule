const express = require('express');
//const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
let User = require('./models/user.model');
let EmailList = require('./models/emailList.model');
const bcrypt = require('bcrypt');
const path = require("path");
require('dotenv').config();

process.env.TZ = 'Asia/Hong_Kong';
const app = express();
const port = process.env.PORT || 3000;
//app.use(cors());
app.use(express.json());
app.use(cookieParser());
const uri = process.env.DB_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.once('open', ()=>{
	console.log("MongoDB connection established successfully.");
}).on('error', (err)=>{
	console.log('Error occurs while connecting to database...');
});

//Router Setting
const userRouter = require('./routes/user');

//app.use('/api/user', userRouter);
app.use('/api/user', passport.authenticate('token', { session: false }), userRouter);
app.post('/api/signin', passport.authenticate('signin', { session: false }), auth);
app.get('/api/checkToken', passport.authenticate('token', { session: false }), function(req, res) {
 	res.sendStatus(200);
});

//Create a user
app.post('/api/add', async (req, res)=>{
	const username = req.body.username;
	const password = req.body.password;
	const name = req.body.name;
	const email = req.body.email;
	let isExist = await User.exists({username: username});
	if(isExist){
		res.json('Username already exist!');
	}
	else{
		bcrypt.hash(password, 10, (err, hash)=>{
			if(err){
				res.json('Error occurs while hashing password.');
			}
			else{
				const newUser = new User({username: username,
								password: hash,
								name: name,
								email: email});
				newUser.save()
				.then(() => res.json('User added successfully!'))
				.catch(err => {console.log(err);res.status(400).json(`Error: ${err}`);});
				EmailList.create({email: email}, (err, em)=>{
					if(err) return handleError(err);
				});
			}
		});
	}
});

//Cancel email sending
app.get('/api/cancel_email/:email', (req, res)=>{
	let email = req.params.email;
	EmailList.deleteOne({email: email}, (err, result)=>{
		if (err) {
		    res.send(err);
	  	} else {
	  		if(result.deletedCount == 0){
	  			res.send("Email not found.");
	  		}
	  		else{
	  			res.send("Email unsubscribed successfully.");
	  		}
		    
	  	}
	});
});

if (process.env.NODE_ENV === 'production') {
  	app.use(express.static('../client/build'));
	// any routes not picked up by the server api will be handled by the react router
	app.use('/*', (req, res)=>{
		res.sendFile(path.join(__dirname, '../client/build/index.html'));
	});
}

app.listen(port, ()=>{
	console.log(`Server is running on port ${port}.`);
});