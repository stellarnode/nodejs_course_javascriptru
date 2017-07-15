const Router = require('koa-router');
const router = new Router();

const util = require('util');
const EventEmitter = require('events').EventEmitter;
const dispatcher = new EventEmitter();

// const test = require('./test');
// const basic = require('./basic');
// const chat = require('./chat');

// router.use(/^[(\/views)|(\/user)]/, basic.routes());
// router.use(/^[(\/subscribe)|(\/publish)]/, chat.routes());

let clients = [];

function getMessage() {

    // TODO: Event listeners are not removed if connection is closed by client........

    return new Promise((resolve, reject) => {
        dispatcher.on('newMessage', (message) => {
            if (message) {
                dispatcher.removeAllListeners();
                resolve(message);
            } else {
                reject();
            }
        });
    });
}

router.get('/subscribe', async function(ctx, next) {
    // ctx.req.on('close', () => {
    //     clients.splice(clients.indexOf(ctx), 1);
    // });

    // clients.push(ctx);

    ctx.body = await getMessage();

});

router.post('/publish', async function(ctx, next) {

    if (ctx.request.length > 512) {
        ctx.status = 413;
        ctx.body = "Your message is too big for my little chat";
    } 

    let message = ctx.request.body.message;
    console.log(message);

    if (!message) {
        ctx.status = 400;
        ctx.body = "Bad request";
    } else {

        dispatcher.emit('newMessage', message);

        // clients.forEach((ctx) => {
        //     ctx.body = message;
        // });
        // clients = [];

        ctx.status = 200;
    }
});

router.get('/', async function(ctx, next) {

});

module.exports = router;