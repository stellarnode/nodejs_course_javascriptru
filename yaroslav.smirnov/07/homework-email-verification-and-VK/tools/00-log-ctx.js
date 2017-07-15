
module.exports.init = (app) => app.use(async (ctx, next) => {
    console.log('ctx before all middleware: \n', ctx);
    await next();
    console.log('ctx after all middleware: \n', ctx);
});