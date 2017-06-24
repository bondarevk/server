const express = require('express');
const passport = require('passport');

const auth = require('./auth');

const router = express.Router();

/**
 * Views
 */
router.get('/', (req, res) => {
  res.render('index.hbs', {
    user: req.user
  });
});
router.get('/login', (req, res) => {
  res.render('login.hbs', {
    user: req.user
  });
});
router.get('/signup', (req, res) => {
  res.render('signup.hbs', {
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
router.post('/login', auth.authenticate('local'), (req, res, next) => {
  res.json({ result: true });
});
router.post('/signup', auth.signup);
router.get('/test', auth.requireLogin, (req, res, next) => {
  res.json({ result: 'done' });
});

module.exports = router;