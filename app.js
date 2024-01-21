var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var qs = require('querystring');
var { Strategy } = require('passport-saml');
const axios = require('axios');
var fs = require('fs')

// source and import environment variables
require('dotenv').config({ path: '.okta.env' })
const { ORG_URL, CLIENT_ID, CLIENT_SECRET } = process.env;

var indexRouter = require('./routes/index');
var config = require('./config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'CanYouLookTheOtherWay',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// --- SAML ---

passport.serializeUser((user, next) => {
  next(null, user);
});

passport.deserializeUser((obj, next) => {
  next(null, obj);
});

passport.use('saml',
        new Strategy(
            {
                issuer: config.saml.issuer,
                protocol: 'http://',
                path: '/login/callback',
                entryPoint: config.saml.entryPoint,
                cert: fs.readFileSync(config.saml.cert, 'utf-8')
            },
            (expressUser, done) => {
              return done(null, expressUser);
            }
          )
        );

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login')
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header('origin'));
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method == 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

/** Passport & SAML Routes */
app.use('/', indexRouter);

app.use('/login', passport.authenticate('saml', config.saml.options));

app.use('/login/callback', passport.authenticate('saml', config.saml.options),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.use('/profile', ensureLoggedIn, (req, res) => {
  res.render('profile', { authenticated: req.isAuthenticated(), user: req.user });
});


passport.use('saml-slo',
new Strategy(
    {
        issuer: config.saml.issuer,
        protocol: 'http://',
        path: '/logout',
        entryPoint: 'https://dev-24943231.okta.com/app/dev-24943231_samltestapp_1/exkel5jc3zZqZpZHO5d7/slo/saml',
        cert: fs.readFileSync(config.saml.cert, 'utf-8')
    },
    () => {
      return done(null);
    }
  )
)
app.use('/logout', passport.authenticate('saml-slo', config.saml.options));

app.post('/logout', (req, res, next) => {
  res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message + (err.code && ' (' + err.code + ')' || '') +
    (req.session.messages && ": " + req.session.messages.join("\n. ") || '');
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
