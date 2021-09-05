const mongoose = require('mongoose');

const schema = mongoose.Schema({
  userId: String,
  text: String,
  dateTime: Date,
  messageType: {type: String, enum: ['ANSWER', 'QUESTION'], default: 'QUESTION'},
  closed: {type: Boolean, default: false}
});

module.exports = mongoose.model('Messages', schema);