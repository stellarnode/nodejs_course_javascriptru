const passport = require('koa-passport');
const User = require('../models/user');
const _ = require('lodash');
const winston = require('winston');
const sendMail = require('../libs/sendMail');
const uuid = require('uuid/v4');
const config = require('config');

module.exports.get = async function(ctx, next) {
    ctx.body = ctx.render('register');
}

module.exports.post = async function(ctx, next) {
    let user = await User.getSafeFields(ctx.request.body);
    // console.log('route received user data: \n', ctx.request.body);

    user.uuid = uuid();
    user.emailVerified = false;
    console.log('route received user data: \n', user);

    user = new User(user);
    let newUser;

    try {
        newUser = await User.create(user); // a = new User(); a.save()
        // await user.validate();
    } catch(err) {
        console.error(err);
        ctx.flash('error', 'User with this display name or email already exists. Try something different.');
        ctx.redirect('/');
    }

    // let newUser = await user.save();

    if (!newUser) {
        winston.error('Could not save user...');
        // ctx.flash('error', 'Could not save. Please try again.');
        ctx.redirect('/');
    } else {

        // await passport.authenticate('local', {
        //     successRedirect: '/',
        //     failureRedirect: '/',
        //     //failureMessage: true // запишет сообщение об ошибке в session.messages[]
        //     failureFlash: true // req.flash, better
        //     }
        // )(ctx, next);

        await sendMail({
            template: 'hello',
            to: newUser.email,
            name: newUser.displayName,
            subject: 'Verify your email address',
            verifyLink: `${config.server.siteHost}:${config.server.port}/email-verified/${newUser.uuid}`
        });

        // ctx.redirect('/register/thank-you');
        ctx.body = ctx.render('register-thank-you');
    }
}
