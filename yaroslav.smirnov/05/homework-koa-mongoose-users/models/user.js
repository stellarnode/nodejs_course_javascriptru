const config = require('config');

const mongoose = require(config.get('dbConnectPath'));

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: 'Email is required',
        unique: 'This email is already in use',
        validate: [{
            validator: function checkEmail(value) {
                return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
            },
            msg: 'Please provide a valid email address.'
        }],
        lowercase: true,
        trim: true,
        minlength: 2,
        maxlength: 256
    },

    displayName: {
        type: String,
        required: 'Provide display name',
        unique: 'This display name is already in use',
        trim: true
    }

}, {
    timestamps: true
});

userSchema.methods.getPublicFields = function () {
  return {
    email: this.email,
    displayName: this.displayName,
    id: this.id
  };
}

userSchema.statics.publicFields = ['displayName', 'email'];

module.exports = mongoose.model('User', userSchema);
