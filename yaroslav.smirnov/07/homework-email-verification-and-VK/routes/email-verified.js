const User = require('../models/user');
const winston = require('winston');

module.exports.get = async (ctx, next) => {

    console.log('uuid from params\n', ctx.params.uuid);
    let uuid = ctx.params.uuid;

    let user = await User.findOne({ uuid });

    if (!user) {

        ctx.flash('error', 'Could not find user and verify email');
        winston.warn('Could not find user with the UUID received with a link from email');
        ctx.body = ctx.render('email-not-verified');

    } else {

        user.emailVerified = true;
        let updatedUser = await user.save();

        // await ctx.login(user);
        ctx.body = ctx.render('email-verified');
    }

};
