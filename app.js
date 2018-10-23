const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const indexRouter = require('./routes/routes');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const dbUrl = "mongodb://localhost:27017";

mongoose.connect(dbUrl, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
app.db = mongoose.connection;

const server = app.listen(3000, 'localhost', function () {
    console.log('Server started.');
    app.db.on('error', function(){
        console.error("Couldn't connect to database.");
        process.exit(1)
    });
    app.db.once('open', function () {
        console.log("Database is started.");
    })
});

module.exports = app;
