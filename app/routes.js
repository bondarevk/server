const express = require('express');
const passport = require('passport');

const auth = require('./auth');

const router = express.Router();

/**
 * Views
 */
router.get('/', (req, res) => {
  res.render('index.hbs');
});
router.get('/login', (req, res) => {
  res.render('login.hbs');
});
router.get('/signup', (req, res) => {
  res.render('signup.hbs');
});

/**
 * API
 */
router.post('/login', auth.authenticate('local'), (req, res, next) => {
  res.json({ result: 'success' });
});
router.post('/signup', auth.signup);
router.post('/test', auth.requireLogin, (req, res, next) => {
  res.json({ result: 'done' });
});

module.exports = router;