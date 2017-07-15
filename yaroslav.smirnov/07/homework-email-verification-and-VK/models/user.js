const mongoose = require('mongoose');
const crypto = require('crypto');
const _ = require('lodash');
const config = require('config');

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    unique: 'This display name is already taken. Try a different one.',
    required: "Display name cannot be blank."
  },
  realName: {
    type: String
  },
  email: {
    type: String,
    unique: 'This email is already in use. Try a different one.',
    required: "E-mail cannot be blank.",
    validate: [
      {
        validator: function checkEmail(value) {
          return this.deleted ? true : /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
        },
        msg: 'Please provide a valid email address.'
      }
      // 'sha512'
    ] // sdfjhaw76f4f6afhahdf + password => asdkfa7s6f4q3fha;dkhjfa34f7348fad
  },
  uuid: {
    type: String,
    // unique: true,
    // index: true
  },
  emailVerified: {
    type: Boolean
  },
  passwordHash: {
    type: String,
    // required: true
  },
  salt: {
    // required: true,
    type: String
  },
  jwtToken: {
    type: String
  },
  gender: {
    type: String,
    enum: {
      values:  ['male', 'female'],
      message: "Неизвестное значение для пола."
    }
  },
  providers: [{
    name:    String,
    nameId:  {
      type:  String,
      index: true
    },
    profile: {} // updates just fine if I replace it with a new value, w/o going inside
  }],
  deleted: Boolean
}, {
  timestamps: true
});

// const user = new User({password: 123})
// user.password; // 123

// const user = await User.findOne({});

userSchema.index({ uuid: 1 });

userSchema.virtual('password')
  .set(function(password) {

    if (password !== undefined) {
      if (password.length < 4) {
        this.invalidate('password', 'Пароль должен быть минимум 4 символа.');
      }
    }

    this._plainPassword = password;

    if (password) {
      this.salt = crypto.randomBytes(config.crypto.hash.length).toString('base64');
      this.passwordHash = crypto.pbkdf2Sync(
        password,
        this.salt,
        config.crypto.hash.iterations,
        config.crypto.hash.length,
        'sha512'
      ).toString('base64');
    } else {
      // remove password (unable to login w/ password any more, but can use providers)
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(function() {
    return this._plainPassword;
  });

userSchema.methods.checkPassword = function(password) {
  if (!password) return false; // empty password means no login by password
  if (!this.passwordHash) return false; // this user does not have password (the line below would hang!)
  // bcrypt.compare(password, this.passwordHash) // sync?
  const passwordHash = crypto.pbkdf2Sync(
    password,
    this.salt,
    config.crypto.hash.iterations,
    config.crypto.hash.length,
    'sha512'
  ).toString('base64');

  return passwordHash === this.passwordHash;
};

userSchema.statics.getSafeFields = function(body) {
  return _.pick(body, ['displayName', 'email', 'password']);
};

userSchema.statics.findByToken = async function() {};

module.exports = mongoose.model('User', userSchema);
