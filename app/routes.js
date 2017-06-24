const express = require('express');
const passport = require('passport');

const auth = require('./auth');

const mainRouter = express.Router();

mainRouter.get('/', (req, res) => {
  res.render('index.hbs');
});

mainRouter.post('/login', auth.authenticate('local'), (req, res, next) => {
  res.json({ result: 'success' });
});
mainRouter.post('/signup', auth.signup);
mainRouter.post('/test', auth.requireLogin, (req, res, next) => {
  res.json({ result: 'done' });
});

module.exports = mainRouter;