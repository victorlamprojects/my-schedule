const passport = require('passport');
const jwt = require('jsonwebtoken');
require('../passport/jwtStrategy');
require('../passport/localStrategy');

module.exports = function(req, res) {
  	const token = jwt.sign(JSON.parse(JSON.stringify(req.user)), 'nt94wkubvsadhf');
  	res.status(200).send({ auth: true, token: token });
};