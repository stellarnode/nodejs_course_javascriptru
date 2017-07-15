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

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => require('./handlers/' + handler).init(app));

const router = require(path.join(__dirname, 'routes'));
app.use(router.routes());
// const basicRouter = require('./routes/basic');
// const usersRouter = require('./routes/basic');
// const picturesRouter = require('./routes/basic');

// app.use(basicRouter.routes());
// app.use(usersRouter.routes());
// app.use(picturesRouter.routes());

app.listen(config.get('port'));

app.on('error', (err) => {
  console.error(err);
});
