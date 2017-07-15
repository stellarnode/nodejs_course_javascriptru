const passport = require('koa-passport');
const JwtStrategy = require('passport-jwt');
const User = require('../../models/user');
const config = require('config');
const jwt = require('jsonwebtoken');

const strategyOptions = {};
strategyOptions.jwtFromRequest = JwtStrategy.ExtractJwt.fromAuthHeader();
strategyOptions.secretOrKey = config.secret;

passport.use(new JwtStrategy.Strategy(strategyOptions,

  function(jwt_payload, done) {

    console.log('jwt payload: ', jwt_payload.id);

    User.findById(jwt_payload.id, (err, user) => {
      if (err) {
        return done(err, false);
      }

      if (!user) {
        // don't say whether the user exists
        return done(null, false, { message: 'Нет такого пользователя или пароль неверен.' });
      }

      console.log('user found: \n', user);
      return done(null, user);
    });
  }
));