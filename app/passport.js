const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const auth = require('../config/auth.json');
const User = require('./models/user');

const localStrategy = new LocalStrategy({
  usernameField: 'username',
  passwordField : 'password',
  passReqToCallback : true
}, (req, username, password, done) => {
  User.findOne({username}, null, {collation: {locale: 'en', strength: 2}})
    .then((user) => {
      if (!user) {
        return done(null, false, { message: 'Неверный логин.', message_code: 2, result: false });
      }

      user.compareLocalPassword(password, (error, result) => {
        if (error) {
          return done(error);
        }
        if (!result) {
          return done(null, false, { message: 'Неверный пароль.', message_code: 3, result: false });
        }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return done(null, user);
        });

      });

    })
    .catch((error) => {
      return done(error);
    })
});

module.exports = () => {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => {
        return done(null, user);
      })
      .catch((error) => {
        return done(error);
      })
  });

  passport.use(localStrategy);
};