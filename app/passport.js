const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const authConfig = require('../config/auth.json');
const dbhelper = require('./helpers/dbhelper');
const User = require('./models/user');

const localStrategy = new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, (req, username, password, done) => {
  dbhelper.findUser(username)
    .then((user) => {
      if (!user) {
        return done(null, false, {message: 'Неверный логин.', message_code: 2, result: false});
      }
      user.compareLocalPassword(password, (error, result) => {
        if (error) {
          return done(error);
        }
        if (!result) {
          return done(null, false, {message: 'Неверный пароль.', message_code: 3, result: false});
        }
        return done(null, user);
      });
    })
    .catch((error) => {
      return done(error);
    })
});

const vkontakteStrategy = new VKontakteStrategy({
  clientID: authConfig.vkontakte.clientID,
  clientSecret: authConfig.vkontakte.clientSecret,
  callbackURL: authConfig.vkontakte.callbackURL
}, (accessToken, refreshToken, params, profile, done) => {
  User.findOne({'vkontakte.id': profile.id})
    .then((user) => {
      return done(null, user, {
        vkontakte: {
          id: profile.id,
          name: profile.displayName,
          profileUrl: profile.profileUrl,
          email: params.email
        }
      });
    })
    .catch((error) => {
      return done(error);
    })
});

const googleStrategy = new GoogleStrategy({
  clientID: authConfig.google.clientID,
  clientSecret: authConfig.google.clientSecret,
  callbackURL: authConfig.google.callbackURL,
}, (token, refreshToken, profile, done) => {
  console.log(profile);
  User.findOne({'google.id': profile.id})
    .then((user) => {
      return done(null, user, {
        google: {
          id: profile.id,
          name: profile.displayName,
          emails: profile.emails
        }
      });
    })
    .catch((error) => {
      console.log(error);
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
  passport.use(vkontakteStrategy);
  passport.use(googleStrategy);
};