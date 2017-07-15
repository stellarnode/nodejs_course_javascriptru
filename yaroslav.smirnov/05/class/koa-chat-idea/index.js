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
const events = require('events');

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => require('./handlers/' + handler).init(app));

// can be split into files too
const Router = require('koa-router');

const router = new Router();
/*
  app.middleware = []

  middleware1()
    .then(middleware2)

*/
const clients = [];
const eventEmmiter = new events.EventEmmiter();

/*
  class EventEmmiter {
    constructor() {
      this.events = {};
    }

    on(eventName, handler) {
      if (!this.events[eventName]) this.events[eventName] = [];
      this.events[eventName].push(handler);
    }

    emit(eventName, ...parameters) {
      if (!this.events[eventName]) return;
      this.events[eventName].forEach(handler => handler(...parameters));
    }

    once(eventName, handler) {
      if (!this.events[eventName]) this.events[eventName] = [];
      this.events[eventName].push(() => {
        handler();
        this.removeListener()
      });
    }

    removeListener(eventName, handler) {

    }
  }
*/

router.get('/subscribe', async (ctx) => {
  ctx.repond = false;
  clients.push(ctx.res);

  ctx.res.on('close', () => {
    clients.splice(clients.indexOf(ctx.res));
  });
  // ctx.res.end('message');
  // const message = new Promise((resolve, reject) => {
  //   // clients.push(resolve);
  //   eventEmmiter.once('message', resolve);
  //
  //   ctx.req.on('close', () => {
  //     eventEmmiter.removeListener('message', resolve);
  //     reject('closed');
  //   });
  //
  // });
  //
  // try {
  //   await message;
  // } catch (err) {
  //   if (err.message === 'closed') {
  //
  //   }
  // }
  //
  // ctx.body = message;
});

router.post('/publish', async (ctx) => {
  const message = ctx.request.body.message;
  if (!message) ctx.throw(400);

  // clients.forEach(resolve => resolve(message));
  // eventEmmiter.emit('message', message);
  clients.forEach(res => {
    res.end(String(message));
  });

  ctx.body = 'Ok';

});

app.use(router.routes());

app.listen(config.get('port'));
