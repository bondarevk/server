const express = require('express');
const path = require('path');
const app = express();
const config = require('./config/main.json');
const port = config.port;
const mongoose = require('mongoose');
const passport = require('passport');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const routes = require('./app/routes.js');
const database = require('./config/database.json');

mongoose.connect(database.dbUri);
mongoose.Promise = Promise;
require('./app/passport')();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {secure: false}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

app.use(function(req, res, next) {
  res.status(404);
  res.render('error', {
    title: 'Страница не найдена! :(',
    code: 404,
    message: 'Страница не найдена! :('
  });
});

app.use(logErrors);
app.use(xhrErrorHandler);
app.use(errorHandler);

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function xhrErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ message: 'Что-то сломалось! :(' });
  } else {
    next(err);
  }
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', {
    title: 'Что-то сломалось! :(',
    code: 500,
    message: 'Что-то сломалось! :('
  });
}

app.listen(port);
console.log('Сервер слушает порт: ' + port);