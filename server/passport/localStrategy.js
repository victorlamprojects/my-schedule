const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.model.js');
passport.use('signin', new LocalStrategy({
        usernameField: 'username'
    }, 
    function (username, password, done) {
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
        return User.findOne({username})
           .then(user => {
               if (!user) {
                   return done(null, false, {message: 'Incorrect username or password.'});
               }
               if(user.checkPassword(password)){
                  return done(null, user, {message: 'Logged In Successfully'});
               }
               return done(null, false, {message: 'Incorrect username or password.'});
          })
          .catch(err => done(err, false));
    }
));