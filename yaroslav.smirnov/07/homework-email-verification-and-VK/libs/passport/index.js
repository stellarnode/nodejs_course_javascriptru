const passport = require('koa-passport');
const User = require('../../models/user');

require('./serialize');

require('./localStrategy.js');

require('./jwtStrategy');

passport.use(require('./facebookStrategy'));

passport.use(require('./vkStrategy'));

passport.use(require('./githubStrategy'));

module.exports = passport;
