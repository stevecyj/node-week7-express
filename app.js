var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

const { uncaughtException, unhandledRejection, errorResponder, error404 } = require('./exceptions');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const uploadRouter = require('./routes/upload');

var app = express();

// 程式出現重大錯誤時
process.on('uncaughtException', uncaughtException);

require('./connections');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/upload', uploadRouter);

// catch 404 and forward to error handler
app.use(error404);

// error handler
app.use(errorResponder);

// 未捕捉到的 catch
process.on('unhandledRejection', unhandledRejection);

module.exports = app;
