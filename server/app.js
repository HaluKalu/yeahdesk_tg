const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/yeahdesk_tg');

const messagesRouter = require('./routes/messages');

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/message', messagesRouter);

module.exports = app;
