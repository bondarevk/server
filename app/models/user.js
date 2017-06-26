const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const roles = require('../../config/roles');
const ValidationError = mongoose.Error.ValidationError;

const UserSchema = mongoose.Schema({
    username: {
      type: String,
      index: true,
      unique: true,
      required: true,
      match: [/^[\w]{3,16}$/, 'Имя пользователя не соответствует требованиям']
    },
    role: {
      type: Number,
      enum: roles,
      default: 1
    },
    local: {
      email: {
        type: String,
        index: true,
        unique: true,
        required: true,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Неверный email. Проверьте правильность указанного адреса.']
      },
      password: {
        type: String,
        required: true
      }
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String
    },
    vkontakte: {
      id: String,
      token: String,
      email: String,
      name: String
    }
  },
  {
    timestamps: true
  });

UserSchema.pre('save', function (next) {
  if (!this.isModified('local.password')) return next();

  if (this.local.password !== null && !this.local.password.match(/^[\w@$!,.%*#?&]{6,32}$/)) {
    const err = new ValidationError();
    err.message = 'Пароль не соответствует требованиям';
    return next(err);
  }

  const saltRounds = 10;
  bcrypt.hash(this.local.password, saltRounds, (error, hash) => {
    if (error) return next(error);
    this.local.password = hash;
    next();
  });
});

UserSchema.methods.compareLocalPassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.local.password, (error, result) => {
    if (error) {
      return cb(error);
    }
    cb(null, result);
  });
};

module.exports = mongoose.model('User', UserSchema);