const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const VKontakteStrategy = require('passport-vkontakte').Strategy;

const auth = require('../config/auth.json');
const dbhelper = require('./helpers/dbhelper');
const User = require('./models/user');

const localStrategy = new LocalStrategy({
  usernameField: 'username',
  passwordField : 'password',
  passReqToCallback : true
}, (req, username, password, done) => {
  dbhelper.findUser(username)
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
        return done(null, user);
      });
    })
    .catch((error) => {
      return done(error);
    })
});

const vkontakteStrategy = new VKontakteStrategy(
  {
    clientID:     6090728,
    clientSecret: 'yJqWSiFdgBMovrh0y1E5',
    callbackURL:  'https://bondarevk.tk/auth/vkontakte/callback',
    passReqToCallback : true
  },
  function myVerifyCallbackFn(req, accessToken, refreshToken, params, profile, done) {
    User.findOne({ 'vkontakte.id' : profile.id })
      .then((user) => {
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, {
            vkontakte: {
              id: profile.id,
              name: profile.displayName,
              profileUrl: profile.profileUrl,
              email: params.email
            }
          });
          // const newUser = new User({
          //   'username': profile.username,
          //   'vkontakte.id': profile.id,
          //   'vkontakte.name': profile.displayName,
          //   'vkontakte.profileUrl': profile.profileUrl,
          //   'vkontakte.email': params.email,
          // });
          // newUser.save()
          //   .then((user) => {
          //     done(null, user);
          //   })
          //   .catch((error) => {
          //     done(error);
          //   })
        }
      })
      .catch((error) => {
        return done(error);
      });
  }
);

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
  passport.use(vkontakteStrategy);
};