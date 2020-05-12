const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model.js');
const opts = {}
let cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) token = req.cookies['jwt'];
  return token;
};

opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = 'nt94wkubvsadhf';
passport.use('token', new JwtStrategy(opts, (jwt_payload, done)=> {
		User.findById(jwt_payload._id)
	    .then(user => done(null, user))
	    .catch(err => done(err))
    })
);