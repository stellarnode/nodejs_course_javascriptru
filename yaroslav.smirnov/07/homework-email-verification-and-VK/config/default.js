const defer = require('config/defer').deferConfig;
const path = require('path');

module.exports = {
  // secret data can be moved to env variables
  // or a separate config
  secret:   'mysecret',
  server: {
    siteHost: 'http://localhost',
    port: 3000
  },
  mongoose: {
    uri:     'mongodb://localhost/app',
    options: {
      server: {
        socketOptions: {
          keepAlive: 1
        },
        poolSize:      5
      }
    },
    debug: true
  },
  mailer: {
    transport: 'mailgun',
    mailgun: {
      api_key: 'key-0t0uiks9d2bk4ib6kcbqegu2jdf9hu24',
      domain: 'stellarnode.mailgun.org'
    },
    gmail: {
      user: 'email address',
      password: 'password'
    },
    senders:  {
      // transactional emails, register/forgot pass etc
      default:  {
        fromEmail: 'mailgun@test.stellarnode.ru',
        fromName:  'Nodejs Course Test App',
        signature: "Best regards,<br><em>Nodejs Course Test App</em>"
      },
      /* newsletters example
      informer: {
        fromEmail: 'informer@gmail.com',
        fromName:  'Newsletters',
        signature: "<em>Have fun!</em>"
      }
      */
    }
  },
  crypto: {
    hash: {
      length:     128,
      // may be slow(!): iterations = 12000 take ~60ms to generate strong password
      iterations: process.env.NODE_ENV == 'production' ? 12000 : 1
    }
  },
  providers: {
    facebook: {
      appId: '110547672919224',
      appSecret: 'a84037a0e1966b2b0d88e71b9a447d6c',
      test: {
        login: 'course.test.facebook@gmail.com',
        password: 'course-test-facebook'
      },
      passportOptions: {
        // display: 'popup',
        scope:   ['email']
      }
    },
    vk: {
      appId: '6106340',
      appSecret: 'udvLn5WfiYzKKxkWusyy',
      serviceToken: '70e59a9e70e59a9e70e59a9e4e70b8b67a770e570e59a9e29849bd7976d7a6d75dbd8e3',
      passportOptions: {
        scope: ['email']
      },
    },  
    github: {
      clientID: '956a50acfbd0cece7329',
      clientSecret: 'f91997c155509019eef0b7bc86cbc5da6cea9191',
      callbackURL: '/auth/github/callback',
      scope: ['user:email']
    }
  },
  template: {
    // template.root uses config.root
    root: defer(function(cfg) {
      return path.join(cfg.root, 'templates');
    })
  },
  root: process.cwd()
};
