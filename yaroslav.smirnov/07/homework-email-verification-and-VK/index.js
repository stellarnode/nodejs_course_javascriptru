// A "closer to real-life" app example
// using 3rd party middleware modules
// P.S. MWs calls be refactored in many files

// long stack trace (+clarify from co) if needed
if (process.env.TRACE) {
  require('./libs/trace');
}

const Koa = require('koa');
const app = new Koa();

const config = require('config');
const mongoose = require('./libs/mongoose');
const passport = require('./libs/passport');

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();

handlers.forEach(handler => require('./middlewares/' + handler).init(app));

// ---------------------------------------

// can be split into files too
const Router = require('koa-router');

const router = new Router();

function shouldBeAuthenticated(ctx, next) {
  if (ctx.isAuthenticated()) return next();
  ctx.throw(403);
}
// router.get('/private', shouldBeAuthenticated, require('./routes/private').get);


// api
router.post('/api/register', require('./routes/api-register').post);
router.post('/api/login', require('./routes/api-login').post);
router.get('/api', require('./routes/api-frontpage').get);
router.get('/api/v', require('./routes/api').get);

// browser
router.get('/', require('./routes/frontpage').get);
router.get('/register', require('./routes/register').get);
router.post('/register', require('./routes/register').post);
router.get('/register/thank-you', require('./routes/register-thank-you').get);
router.get('/email-verified/:uuid', require('./routes/email-verified').get);

router.get('/login', require('./routes/frontpage').get);
router.post('/login', require('./routes/login').post);
router.post('/logout', require('./routes/logout').post);

// Loging with Facebook
// login
router.get('/login/facebook', passport.authenticate('facebook', config.providers.facebook.passportOptions));
// connect with existing profile
router.get('/connect/facebook', passport.authorize('facebook', config.providers.facebook.passportOptions));
// http://stage.javascript.ru/auth/callback/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_
router.get('/oauth/facebook', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/',
  failureFlash: true // req.flash
}));

// Loging with VK
// login
router.get('/login/vk', passport.authenticate('vkontakte', config.providers.vk.passportOptions));
// redirect
router.get('/auth/vk/callback', passport.authenticate('vkontakte', {
  successRedirect: '/',
  failureRedirect: '/',
  failureFlash: true // req.flash
}));

// Login with Github
// login
router.get('/login/github', passport.authenticate('github'));
// redirect
router.get('/auth/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/',
  failureFlash: true // req.flash
}));


app.use(router.routes());

app.listen(3000);
console.log('Listening on port 3000');
