const CSRF = require('koa-csrf');
const except = require('koa-except');

exports.init = app => {

  let csrf = new CSRF({
    invalidSessionSecretMessage: 'Invalid session secret',
    invalidSessionSecretStatusCode: 403,
    invalidTokenMessage: 'Invalid CSRF token',
    invalidTokenStatusCode: 403,
    excludedMethods: [ 'GET', 'HEAD', 'OPTIONS' ],
    disableQuery: false
  });

  // app.use(csrf);

  csrf.except = except;

  app.use(csrf
    .except({ path: /^(\/api\/)/})
  );
}; 
