const axios = require('axios').default;

const url = 'http://localhost:3000';

async function getMessageByUserId(userId, page) {
  try {
    const result = await axios.get(`${url}/message/get`, { params: { userId, page } });
    return { result, count: result.data.count };
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function getAllUsers(archived = false, page = 0) {
  try {
    const result = await axios.get(`${url}/message/users`, { params: { archived, page } });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function updateMessages(userId, archived) {
  try {
    const result = await axios.post(`${url}/message/update`, { userId, archived });
    return { result, count: result.data.count };
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function createMessage(userId, text) {
  try {
    const responce = await axios.post(`${url}/message/`, { userId, text, messageType: 'ANSWER' });
    return { result: responce.data };
  } catch (err) {
    console.log(err);
    return err;
  }
}

function parse(data) {
  const messages = data.messages || data;

  const parsedMessages = messages.map((elem, i) => {
    const time = new Date(elem.dateTime);
    const text = `<i>UserId: ${elem.userId} / ${time}</i>\nТип сообщения: <b>${elem.messageType === 'ANSWER' ? 'Ответ' : 'Вопрос'}</b>\n\n${elem.text}`;
    return { oldText: elem.text, time: time.toLocaleString(), text };
  });
  return parsedMessages;
}

module.exports = {
  getMessageByUserId,
  parse,
  getAllUsers,
  updateMessages,
  createMessage
}