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
      if (info.result === undefined) {
        info.result = false;
      }
      return res.json(info);
    } else {
      // TODO: Login
    }
    next();
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