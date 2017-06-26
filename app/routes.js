const express = require('express');
const passport = require('passport');
const moment = require('moment');

const User = require('./models/user');
const reCaptcha = require('./recaptcha');
const auth = require('./auth');

const router = express.Router();

/**
 * Views
 */
router.get('/', (req, res) => {
  res.render('index.hbs', {
    title: 'bondarevk',
    user: req.user
  });
});
router.get('/signin', (req, res) => {
  res.render('signin.hbs', {
    title: 'Вход',
    user: req.user
  });
});
router.get('/signup', (req, res) => {
  res.render('signup.hbs', {
    title: 'Регистрация',
    user: req.user
  });
});
router.get('/user/:username', (req, res, next) => {
  User.findOne({ username: req.params.username }, null, {collation: {locale: 'en', strength: 2}})
    .then((user) => {
      if (user) {
        const regDate = new Date(user.createdAt);
        res.render('user.hbs', {
          title: 'Пользователь ' + (user ? user.username: 'не найден'),
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
      return next(error);
    })
});

/**
 * API
 */
router.get('/auth/vkontakte', auth.authenticate('vkontakte'));
router.get('/auth/vkontakte/callback', auth.authenticate('vkontakte'), (req, res, next) => {
  console.log(req.user);
  req.logIn(req.user, function () {
    res.redirect('/');
  });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
router.post('/check-username', auth.checkUsername);
router.post('/signin', auth.authenticate('local'), (req, res, next) => {
  res.json({ result: true });
});
router.post('/signup', reCaptcha.validate, auth.signup);
router.get('/test', auth.requireSignin, (req, res, next) => {
  res.json({ result: 'done' });
});

module.exports = router;