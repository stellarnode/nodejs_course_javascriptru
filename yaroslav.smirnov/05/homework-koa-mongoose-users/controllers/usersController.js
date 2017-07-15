const config = require('config');

const { User } = require(config.get('modelsPath'));
const _ = require('lodash');

// const testing = process.env.NODE_ENV != 'test';

const Router = require('koa-router');
const router = new Router();

router.get('/users', async (ctx, next) => {
    // try {
    let users = await User.find();
    ctx.body = users.map(user => user.getPublicFields());
    // } catch (err) {
    //     ctx.status = 500;
    //     console.error(err);
    // }
});

router.get('/users/:id', async (ctx, next) => {
    // 'lalala', 13123123
    if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) ctx.throw(404);
    // try {
    let user = await User.findById(ctx.params.id);
    if (user) {
        ctx.body = user;
    } else {
        // throw new Error();
        ctx.throw(404);
    }
    // } catch (err) {
    //     console.error(err);
    //     ctx.status = 404;
    //     ctx.body = formatResponseWithErrors(`User with id ${ctx.params.id} not found.`);
    // }
});

router.post('/users', async (ctx, next) => {
    let params = _.pick(ctx.request.body, User.publicFields);

    try {
        let user = await User.create({ email: params.email, displayName: params.displayName });
        if (user) {
            ctx.body = user;
        } else {
            throw new Error();
        }
    } catch (err) {
        // console.error(err);
        if (err.errors) {
            let response = formatResponseWithMongooseErrors(err);
            ctx.status = 400;
            ctx.body = response;
        } else {
            // ctx.status = 500;
            // ctx.body = formatResponseWithErrors('User could not be created.');
            throw err;
        }
    }
});

router.patch('/users/:id', async (ctx, next) => {
    let params = _.pick(ctx.request.body, User.publicFields);

    let updateObj = {};
    if (params.email) {
        updateObj.email = params.email;
    }
    if (params.displayName) {
        updateObj.displayName = params.displayName;
    }

    // alternative:
    // const user = await User.findById(...);
    // user.displayName =
    // user.email =
    // await user.save()
    try {
        let updatedUser = await User.findOneAndUpdate({
            _id: ctx.params.id
        }, {
            $set: updateObj
        }, {
            new: true,
            runValidators: true
        });

        if (updatedUser) {
            ctx.body = updatedUser;
        } else {
            throw new Error();
        }
    } catch (err) {
        console.error(err);
        if (err.errors) {
            let response = formatResponseWithMongooseErrors(err);
            ctx.status = 400;
            ctx.body = response;
        } else if (err.message.indexOf('id') > -1 || err.message.toLowerCase().indexOf('cast') > -1) {
            ctx.status = 404;
            ctx.body = formatResponseWithErrors(`User with id ${ctx.params.id} not found.`);
        } else {
            ctx.status = 500;
            ctx.body = formatResponseWithErrors('User could not be updated.');
        }
    }
});

router.del('/users/:id', async (ctx, next) => {

    try {
        let user = await User.findByIdAndRemove(ctx.params.id);
        if (user) {
            ctx.body = user;
        } else {
            throw new Error();
        }
    } catch (err) {
        console.error(err);
        ctx.status = 404;
        ctx.body = formatResponseWithErrors(`User with id ${ctx.params.id} not found.`);
    }

});

function formatResponseWithMongooseErrors(err) {
    let response = {
        errors: {
            server: 'Validation failed. Provided [email] and/or [displayName] not valid or already in use.'
        }
    };
    if (err.errors.email) {
        response.errors.email = err.errors.email.message ? err.errors.email.message : null;
    }
    if (err.errors.displayName) {
        response.errors.displayName = err.errors.displayName.message ? err.errors.displayName.message : null;
    }
    return response;
}

function formatResponseWithErrors(message) {
    let response = { errors: {} };
    if (message) {
        response.errors.server = message;
    }
    return response;
}

module.exports = router;
