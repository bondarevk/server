const express = require('express');
const passport = require('passport');
const moment = require('moment');

const User = require('./models/user');
const config = require('../config/main.json');
const reCaptcha = require('./recaptcha');
const authhelper = require('./helpers/authhelper');
const dbhelper = require('./helpers/dbhelper');
const signupController = require('./controllers/signup');
const checkusernameController = require('./controllers/checkusername');


const router = express.Router();

/**
 * Главная страница
 */
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Главная' + config.title,
    user: req.user
  })
});

/**
 * Форма аутентификации
 */
router.get('/signin', authhelper.requireAnon, (req, res) => {
  res.render('signin', {
    title: 'Вход' + config.title
  })
});

/**
 * Форма регистрации
 */
router.get('/signup', authhelper.requireAnon, (req, res) => {
  res.render('signup', {
    title: 'Регистрация' + config.title
  })
});

/**
 * Личный кабинет
 */
router.get('/account', authhelper.requireSignin, (req, res) => {
  console.log(req.user.vkontakte);
  res.render('account', {
    title: 'Личный кабинет' + config.title,
    user: req.user
  })
});

/**
 * Профиль пользователя
 */
router.get('/user/:username', (req, res, next) => {
  dbhelper.findUser(req.params.username)
    .then((user) => {
      if (user) {
        const regDate = new Date(user.createdAt);
        res.render('user', {
          title: `Пользователь ${user.username}` + config.title,
          suser: user,
          regDate: moment(regDate).format('DD.MM.YYYY HH:MM'),
          user: req.user
        });
      } else {
        res.render('user', {
          title: 'Пользователь не найден' + config.title,
          suser: null,
          user: req.user
        });
      }
    })
    .catch((error) => {
      next(error);
    })
});

/**
 * VK Auth
 */
router.get('/auth/vkontakte', authhelper.authenticate('vkontakte', { scope: ['email'] }));
router.get('/auth/vkontakte/callback', authhelper.oauthCallbackAuthenticate('vkontakte'), (req, res) => {
  res.redirect('/');
});

/**
 * Google Auth
 */
router.get('/auth/google', authhelper.authenticate('google', { scope : ['profile', 'email'] }));
router.get('/auth/google/callback', authhelper.oauthCallbackAuthenticate('google'), (req, res) => {
  res.redirect('/');
});

/**
 * Local Auth
 */
router.post('/signup', authhelper.requireAnon, reCaptcha.validate, signupController);
router.post('/signin', authhelper.requireAnon, authhelper.authenticate('local'), (req, res) => {
  res.json({ result: true });
});
router.post('/check-username', checkusernameController);

/**
 * Завершение регистрации аккаунта (oauth)
 */
router.get('/auth-connect', authhelper.requireAnon, (req, res, next) => {
  const authConnect = req.session.authConnect;
  if (!authConnect) {
    res.redirect('/');
  } else {
    let header = '';
    let icon = '';
    if (authConnect.vkontakte) {
      header = authConnect.vkontakte.name;
      icon = '/images/vk.png';
    } else {
      return res.redirect('/');
    }
    res.render('authconnect', {
      title: 'Завершение регистрации аккаунта' + config.title,
      header: header,
      icon: icon
    })
  }
});
router.post('/auth-connect', authhelper.requireAnon, (req, res, next) => {
  const username = req.body.username;
  const authConnect = req.session.authConnect;
  if (!username || !authConnect) {
    return res.json({message: 'Отсутствуют обязательные параметры.', message_code: 2, result: false});
  }

  dbhelper.findUser(username)
    .then((user) => {
      if (user) {
        return res.json({message: 'Этот логин занят.', message_code: 3, result: false});
      }

      const newUser = new User(Object.assign({username}, authConnect));
      newUser.save()
        .then((user) => {
          req.logIn(user, function () {
            delete req.session.authConnect;
            res.json({message: '', message_code: 1, result: true});
          });
        })
        .catch((error) => {
          if (error.name === 'ValidationError') {
            if (Object.values(error.errors).length > 0) {
              return res.json({message: Object.values(error.errors)[0].message, message_code: 4, result: false});
            }
            return res.json({message: error.message, message_code: 4, result: false});
          }
          return next(error);
        })
    })
    .catch((error) => {
      return next(error);
    })
});

/**
 * Выход
 */
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;