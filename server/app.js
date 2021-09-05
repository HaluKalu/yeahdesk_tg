require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const mongoose = require('mongoose');
const DATABASE_URL = `${process.env.DB_URL}/${process.env.DB_NAME}`;
mongoose.connect(DATABASE_URL);

const messagesRouter = require('./routes/messages');

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/message', messagesRouter);

module.exports = app;
