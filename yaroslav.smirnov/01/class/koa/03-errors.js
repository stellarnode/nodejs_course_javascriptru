// Handling errors

const Koa = require('koa');
const app = new Koa();

// class DatabaseConnectionError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = 'DatabaseConnectionError';
//   }
// }

app.use(async function(ctx, next) {
  try {
    await next();
  } catch (e) {
    // if (e instanceOf DatabaseConnectionError) {
    //   ...
    // }
    if (e.status) { // User error
      ctx.status = e.status;
      ctx.body = e.message;
    } else { // Server error
      ctx.body = "Error 500";
      ctx.status = 500;
      console.error(e.message, e.stack);
    }
  }
});

app.use(async function(ctx, next) {

  switch(ctx.url) {
    case '/1':
      // all dies, Q: how to see the trace?
      await new Promise(async function(resolve, reject) {
        setTimeout(() => throw new Error("Error in callback"), 1000);
      });
      break;

    case '/2':
      // normal error-handling, stack trace, 500
      await new Promise(function(resolve, reject) {
        setTimeout(reject, 1000, new Error("Error in callback"));
      });
      break;

    case '/3':
      // normal error-handling, 500
      throw(new Error("Error thrown"));

    case '/4':
      // user-level error (the difference: error.status), show 403
      ctx.throw(403, "Sorry, access denied");

    default:
      ctx.body = 'ok';
  }

});

app.listen(3000);
