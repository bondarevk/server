const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const passportSocketIo = require('passport.socketio');
const path = require('path');
const config = require('./config/main.json');
const port = config.port;
const mongoose = require('mongoose');
const passport = require('passport');
const hbs = require('hbs');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();
const server = http.Server(app);
const io = socketio(server);

const routes = require('./app/routes.js');
const database = require('./config/database.json');

mongoose.connect(database.dbUri);
mongoose.Promise = Promise;
require('./app/passport')();

const sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

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
  store: sessionStore,
  cookie: {secure: false}
}));
app.use(passport.initialize());
app.use(passport.session());

io.use(passportSocketIo.authorize({
  key: 'connect.sid',
  secret: config.sessionSecret,
  store: sessionStore,
  passport: passport,
  cookieParser: cookieParser,
  success: (data, accept) => {
    accept(null, true);
  },
  fail: (data, message, error, accept) => {
    accept(null, true);
  }
}));
require('./app/chat')(io);
require('./app/hbs')(hbs);

app.use(routes);

app.use(function(req, res, next) {
  res.status(404);
  res.render('error', {
    title: 'Страница не найдена! :(' + config.title,
    code: 404,
    message: 'Страница не найдена! :(',
    user: req.user
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
    title: 'Что-то сломалось! :(' + config.title,
    code: 500,
    message: 'Что-то сломалось! :(',
    user: req.user
  });
}

server.listen(port);
console.log('Сервер слушает порт: ' + port);