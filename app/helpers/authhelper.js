const passport = require('passport');
const config = require('../../config/main.json');

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

      if (req.isAuthenticated()) {
        let user = req.user;
        if (info.vkontakte) {
          user.vkontakte = info.vkontakte;
        } else if (info.google) {
          user.google = info.google;
        }
        user.save()
          .then((user) => {
            res.redirect('/account');
          })
          .catch((error) => {
            return next(error);
          });
        return;
      }

      req.session.authConnect = info;
      res.redirect('/auth-connect');
    } else {

      if (req.isAuthenticated()) {
        let message = '';
        if (info.vkontakte) {
          message = `Аккаунт ВКонтакте "${info.vkontakte.name}" уже используется для авторизации на сайте.`;
        } else if (info.google) {
          message = `Аккаунт Google "${info.google.name}" уже используется для авторизации на сайте.`;
        }
        return res.render('error', {
          title: 'Ошибка' + config.title,
          user: req.user,
          message: message
        });
      }

      // Обновляем информацию аккаунта
      if (info.vkontakte) {
        user.vkontakte = info.vkontakte;
      } else if (info.google) {
        user.google = info.google;
      }
      user.save()
        .then((user) => {
          req.logIn(user, function(err) {
            if (err) {
              return next(err);
            }
            next();
          })
        })
        .catch((error) => {
          return next(error);
        });
    }
  })(req, res, next);
};

/**
 * Только для НЕ аутентифицированных пользователей
 */
exports.requireAnon = (req, res, next) => {
  if (!req.isAuthenticated())
    return next();

  res.redirect('/');
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