const express = require('express');
const passport = require('passport');

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

/**
 * API
 */
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
router.post('/check-username', auth.checkUsername);
router.post('/signin', auth.authenticate('local'), (req, res, next) => {
  res.json({ result: true });
});
router.post('/signup', auth.signup);
router.get('/test', auth.requireSignin, (req, res, next) => {
  res.json({ result: 'done' });
});

module.exports = router;