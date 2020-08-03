var createError = require('http-errors');
var express = require('express');
var path = require('path');
require('dotenv').config();
require('./database/database');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Book store API Routes
app.use(['/api/login', '/api/auth'], require('./routes/index'));
app.use(['/register', '/api/createUser'], require('./routes/register'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/user', require('./routes/users'));
app.use('/api/books', require('./routes/books'));
app.use('/', (req, res) => res.send('The Book Store API Server Running.'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
