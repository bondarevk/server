const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
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
  secret: 'whoop',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {secure: false}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

app.listen(port);
console.log('Port ' + port);