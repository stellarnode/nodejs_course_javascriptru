
if (process.env.TRACE) {
  require('./libs/trace');
}

const Koa = require('koa');
const app = new Koa();

const config = require('config');

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => require('./handlers/' + handler).init(app));

const { usersController } = require(path.join(__dirname, 'controllers'));
app.use(usersController.routes());

const Router = require('koa-router');
const router = new Router();

router.get('/views', async function(ctx, next) {
  ctx.body = ctx.render('./templates/index.pug');
});

router.get('/', async function(ctx) {
  ctx.redirect('/views');
});

app.use(router.routes());

const server = app.listen(config.get('port'));
console.log(`Server listening on port ${config.get('port')}`);

module.exports = {
  server,
  app
};