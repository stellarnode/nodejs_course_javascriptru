const VKontakteStrategy = require('passport-vkontakte').Strategy;
const config = require('config');
const winston = require('winston');
const User = require('../../models/user');
const authenticateByProfile = require('./authenticateByProfile');
const inspect = require('util').inspect;
const request = require('request-promise');


function UserAuthError(message) {
  this.message = message;
}


module.exports = new VKontakteStrategy({
    clientID:     config.providers.vk.appId, // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId' 
    clientSecret: config.providers.vk.appSecret,
    callbackURL:  `${config.server.siteHost}:${config.server.port}/auth/vk/callback`
  },
    async function(accessToken, refreshToken, params, profile, done) {

    
    //  console.log(params.email); // getting the email 

        try {

            console.log('\n','access token \n', accessToken + '\n', 'refresh token \n', refreshToken + '\n', 'params \n', inspect(params) + '\n', 'params.email\n', params.email + '\n', 'profile\n', inspect(profile) + '\n');

            // winston.info('Received VK profile: \n');
            // winston.debug(profile);
            
            let permissionError = null;
            
            if (!params.email) { // user may allow authentication, but disable email access (e.g in fb)
                throw new UserAuthError("При входе разрешите доступ к email. Он используется для идентификации пользователя.");
            }

            if (params.email && !profile.email) {
                profile.email = params.email;
            }

            // https://api.vk.com/method/METHOD_NAME?PARAMETERS&access_token=ACCESS_TOKEN

            // https://api.vk.com/method/users.get?user_ids=1644770&fields=photo_big&access_token=70e59a9e70e59a9e70e59a9e4e70b8b67a770e570e59a9e29849bd7976d7a6d75dbd8e3

            const response = await request.get({
                url: 'https://api.vk.com/method/users.get?' + `user_ids=${profile.id}` + '&fields=photo_big' + '&access_token=' + accessToken,
                json: true
            });

            console.log(response);

            const photoData = response.response[0].photo_big;

            profile.photos = [{
                value: photoData,
                type: photoData ? 'photo' : 'default'
            }];

            profile.displayName = profile.name.givenName + " " + profile.name.familyName;

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



   
    // await User.findOrCreate({ vkontakteId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
);