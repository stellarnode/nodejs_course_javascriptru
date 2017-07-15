const passport = require('koa-passport');
const User = require('../../models/user');

require('./serialize');

require('./localStrategy.js');

require('./jwtStrategy');

module.exports = passport;
