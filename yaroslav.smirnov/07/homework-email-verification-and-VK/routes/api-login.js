const passport = require('koa-passport');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/user');


exports.get = async (ctx, next) => {
  ctx.render('login');
};

exports.post = async (ctx, next) => {

  await passport.authenticate('local', { session: false }, function(err, user) {

    if (!user) {
      ctx.body = 'Login failed.';
    } else {

      const payload = {
        id: user.id,
        displayName: user.displayName,
        email: user.email
      };
      const token = jwt.sign(payload, config.secret);
      
      ctx.body = { user: user.displayName, token: 'JWT ' + token };
    }

  })(ctx, next);

};