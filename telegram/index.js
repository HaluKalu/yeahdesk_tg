require('dotenv').config();

const TgBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const bot = new TgBot(token, {polling: true});


const mongoose = require('mongoose');
const DATABASE_URL = `${process.env.DB_URL}/${process.env.DB_NAME}`;
(async () => { await mongoose.connect(DATABASE_URL); })();


require('./services/bot_routes')(bot);

console.log('Bot started work!');
