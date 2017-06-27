const passport = require('passport');

/**
 * Оболочка для аутентификации Passport
 */
exports.authenticate = (name, options) => (req, res, next) => {
  passport.authenticate(name, options, (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      if (!info) {
        info = {};
      }
      if (info.result === undefined) {
        info.result = false;
      }
      return res.json(info);
    } else {
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        next();
      });
    }
  })(req, res, next);
};

exports.oauthCallbackAuthenticate = (name, options) => (req, res, next) => {
  passport.authenticate(name, options, (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {


      console.log(req.user);
      console.log('vk set session');
      req.session.authConnect = info;
      res.redirect('/auth-connect');
      // Register



    } else {
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        next();
      });
    }
  })(req, res, next);
};

/**
 * Только для аутентифицированных пользователей
 */
exports.requireSignin = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  res.redirect('/signin');
};

/**
 * Авторизация по уровням доступа
 * @param requiredRole Требуемый уровень доступа
 */
exports.roleAuthorization = function (requiredRole) {
  return function (req, res, next) {
    if (req.user.role >= requiredRole) {
      return next();
    }
    return res.status(403).json({error: 'Доступ запрещен.'});
  }
};