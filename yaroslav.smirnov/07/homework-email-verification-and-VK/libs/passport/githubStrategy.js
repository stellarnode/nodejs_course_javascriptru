const GithubStrategy = require('passport-github');
const config = require('config');
const winston = require('winston');
const User = require('../../models/user');
const authenticateByProfile = require('./authenticateByProfile');
const inspect = require('util').inspect;

module.exports = new GithubStrategy({
        clientID: config.providers.github.clientID,
        clientSecret: config.providers.github.clientSecret,
        callbackURL: config.providers.github.callbackURL,
        scope: config.providers.github.scope
    },
    async function(accessToken, refreshToken, profile, done) {

    try {

        console.log('\n','access token \n', accessToken + '\n', 'refresh token \n', refreshToken + '\n', 'profile\n', inspect(profile) + '\n');

        // winston.info('Received VK profile: \n');
        // winston.debug(profile);
        
        let permissionError = null;
        
        if (!profile.emails) { // user may allow authentication, but disable email access (e.g in fb)
            throw new UserAuthError("При входе разрешите доступ к email. Он используется для идентификации пользователя.");
        }

        if (profile.emails && !profile.email) {
            profile.email = profile.emails[0].value;
        }

        // const response = await request.get({
        //     url: 'https://api.vk.com/method/users.get?' + `user_ids=${profile.id}` + '&fields=photo_big' + '&access_token=' + accessToken,
        //     json: true
        // });

        // console.log(response);

        // const photoData = response.response[0].photo_big;

        // profile.photos = [{
        //     value: photoData,
        //     type: photoData ? 'photo' : 'default'
        // }];

        // profile.displayName = profile.name.givenName + " " + profile.name.familyName;

        authenticateByProfile(undefined, profile, done);

    } catch (err) {
        console.log(err);
        winston.error(err);
        if (err instanceof UserAuthError) {
            console.error(err);
            done(null, false, {message: err.message});
        } else {
            done(err);
    }
}



    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
    });

