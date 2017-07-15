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
router.get('/login', require('./routes/frontpage').get);
router.post('/login', require('./routes/login').post);
router.post('/logout', require('./routes/logout').post);


app.use(router.routes());

app.listen(3000);
console.log('Listening on port 3000');
