// in-memory store by default (use the right module instead)
const session = require('koa-generic-session');
const convert = require('koa-convert');

/*
  id = generateID()
  cookie['id'] = id;

  const state = {
    [id]: {count: 10}
  };

  ctx.session = {count: 10}
*/

exports.init = app => app.use(convert(session({
  cookie: {
    signed: false
  }
})));
