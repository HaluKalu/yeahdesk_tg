const mongoose = require('mongoose');

const schema = mongoose.Schema({
  chatId: String,
  userId: String,
  page: {type: Number, default: 0},
  archived: {type: Boolean, default: false}
});

const Chat = mongoose.model('Chat', schema);

async function updateArchived(chatId, archived) {
  const obj = {archived};

  const result = await Chat.findOneAndUpdate({ chatId }, { ...obj });
  return result;
}

async function updateStatus(chatId, userId, page = 0) {
  chatId = String(chatId);
  const obj = {};
  if (!chatId) {
    return new Error('Field chatId must be provided.');
  }
  obj.chatId = chatId;
  if (userId) {
    obj.userId = userId;
  }
  if (page >= 0) {
    obj.page = page;
  }

  const chat = await Chat.findOne({ chatId });

  if (!chat)
    return await Chat.create({ ...obj });

  const result = await Chat.updateOne({ chatId }, { ...obj });
  return result;
}

async function getCurrentStatus(chatId) {
  chatId = String(chatId);
  const result = await Chat.findOne({ chatId });
  return result;
}

module.exports = {
  Chat,
  updateStatus,
  getCurrentStatus,
  updateArchived
}