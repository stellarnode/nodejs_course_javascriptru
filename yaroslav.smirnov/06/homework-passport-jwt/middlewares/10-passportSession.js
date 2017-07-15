// if (ctx.session.passport.user) {
//   ctx.req.user = user;
// }

exports.init = app => app.use(require('koa-passport').session());
