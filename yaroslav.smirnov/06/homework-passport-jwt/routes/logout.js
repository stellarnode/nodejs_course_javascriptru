const passport = require('koa-passport');

exports.post = async function(ctx, next) {
  ctx.logout();
  ctx.redirect('/');
};
