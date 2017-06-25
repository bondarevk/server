const passport = require('passport');
const User = require('./models/user');

exports.signup = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  if (!username || !password || !email) {
    return res.json({ message: 'Отсутствуют обязательные параметры.', message_code: 2, result: false });
  }

  User.findOne({ username }, null, {collation: {locale: 'en', strength: 2}})
    .then((existingUser) => {

      if (existingUser) {
        return res.json({ message: 'Этот логин занят.', message_code: 3, result: false });
      }

      const user = new User({
        'username': username,
        'local.email': email,
        'local.password': password
      });
      user.save()
        .then((user) => {
          req.logIn(user, function() {
            res.json({ message: '', message_code: 1, result: true });
          });
        })
        .catch((error) => {
          if (error.name === 'ValidationError') {
            if (Object.values(error.errors).length > 0) {
              return res.json({ message: Object.values(error.errors)[0].message, message_code: 4, result: false });
            }
            return res.json({ message: error.message, message_code: 4, result: false });
          }
          return next(error);
        })
    })
    .catch((error) => {
      return next(error);
    })
};

exports.checkUsername = (req, res, next) => {
  const username = req.body.username;
  if (!username) {
    return res.json({ result: false });
  }

  User.findOne({ username }, null, {collation: {locale: 'en', strength: 2}})
    .then((existingUser) => {
      if (existingUser) {
        return res.json({ result: false });
      } else {
        return res.json({ result: true });
      }
    })
    .catch((error) => {
      return next(error);
    })
};

exports.requireLogin = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  res.redirect('/login');
};

exports.authenticate = (name, options) => (req, res, next) => {
  passport.authenticate(name, options, (error, user, info) => {
    if (error) { return next(error); }
    if (!user) {
      if (info.result === undefined) {
        info.result = false;
      }
      return res.json(info);
    }
    return next();
  })(req, res, next);
};

exports.roleAuthorization = function (requiredRole) {
  return function (req, res, next) {
    if (req.user.role >= requiredRole) {
      return next();
    }
    return res.status(403).json({ error: 'Доступ запрещен.' });
  }
};