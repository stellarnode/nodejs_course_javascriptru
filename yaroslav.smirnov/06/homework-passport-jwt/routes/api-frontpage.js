const passport = require('koa-passport');

exports.get = async (ctx, next) => {

    await passport.authenticate('jwt', {session: false}, function (err, user) {
      if (user) {
        ctx.body = {
            message: 'Hello, ' + user.displayName
        };
        console.log('headers if authenticated: ', ctx.request.headers);
      } else {
        ctx.throw(403, 'Access denied.');
        console.log('headers if not authenticated: ', ctx.request.headers);
      }
    })(ctx, next);

};
