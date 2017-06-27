const express = require('express');
const passport = require('passport');
const moment = require('moment');

const User = require('./models/user');
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
  res.render('index.hbs', {
    title: 'bondarevk',
    user: req.user
  })
});

/**
 * Форма аутентификации
 */
router.get('/signin', (req, res) => {
  res.render('signin.hbs', {
    title: 'Вход',
    user: req.user
  })
});

/**
 * Форма регистрации
 */
router.get('/signup', (req, res) => {
  res.render('signup.hbs', {
    title: 'Регистрация',
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
        res.render('user.hbs', {
          title: `Пользователь ${user.username}`,
          user: user,
          regDate: moment(regDate).format('DD.MM.YYYY HH:MM')
        });
      } else {
        res.render('user.hbs', {
          title: 'Пользователь не найден',
          user: null
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
  console.log(req.user);
  res.redirect('/');
});

/**
 * Local Auth
 */
router.post('/signup', reCaptcha.validate, signupController);
router.post('/signin', authhelper.authenticate('local'), (req, res) => {
  res.json({ result: true });
});
router.post('/check-username', checkusernameController);

/**
 * Завершене привязки аккаунта
 */
router.get('/auth-connect', (req, res, next) => {
  if (!req.session.authConnect) {
    res.redirect('/');
  } else {
    res.render('authconnect.hbs', {
      title: 'Привязка аккаунта',
      authConnect: req.session.authConnect
    })
  }
});

/**
 * Выход
 */
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;