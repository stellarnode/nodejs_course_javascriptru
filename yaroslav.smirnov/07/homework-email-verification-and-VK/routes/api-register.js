const jwt = require('jsonwebtoken');
const User = require('../models/user');
const _ = require('lodash');

module.exports.get = async function(ctx, next) {
    ctx.body = ctx.render('register');
}

module.exports.post = async function(ctx, next) {
    let user = await User.getSafeFields(ctx.request.body);
    // console.log('route received user data: \n', ctx.request.body);
    console.log('route received user data: \n', user);
    let newUser = await User.create(user);

    if (!newUser) {
        console.log('could not save...');
        ctx.throw(500, 'Could not save user.');
    } else {
        // ctx.body = newUser;
        ctx.body = User.getSafeFields(newUser);
    }
}