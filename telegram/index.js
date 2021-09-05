const TgBot = require('node-telegram-bot-api');
const token = 'TOKEN';
const bot = new TgBot(token, {polling: true});


const mongoose = require('mongoose');
(async () => { await mongoose.connect('mongodb://127.0.0.1:27017/yeahdesk_tg'); })();


require('./services/bot_routes')(bot);

console.log('Bot started work!');
