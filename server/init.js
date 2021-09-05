const mongoose = require('mongoose');

const Message = require('./models/message');
const faker = require('faker');

(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/yeahdesk_tg');
    console.log('Mongodb connected');
  } catch {
    console.log('Mongodb not connected');
    return;
  }
})();

function generateUsers(count) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({ 'userId': faker.internet.email() });
  }
  return users;
}

function generateMessagesWithUser(count, userId) {
  const messages = [];
  for (let i = 0; i < count; i++) {
    const dateTime = faker.date.past();
    messages.push({ text: faker.lorem.paragraph(10), userId, dateTime });
  }
  return messages;
}

async function init() {
  const usersActive = generateUsers(10);
  const usersClosed = generateUsers(10);

  const messagesActive = usersActive.map((elem) => {
    return generateMessagesWithUser(faker.datatype.number({ min: 10, max: 15 }), elem.userId);
  });
  const messagesClosed = usersClosed.map((elem) => {
    return generateMessagesWithUser(faker.datatype.number({ min: 10, max: 15 }), elem.userId);
  });

  
  for(let i = 0; i < messagesActive.length; i++) {
    for(let j = 0; j < messagesActive[i].length; j++) {
      const res = await Message.create({...messagesActive[i][j], closed: false});
      // console.log(res);
    }
  }

  for(let i = 0; i < messagesClosed.length; i++) {
    for(let j = 0; j < messagesClosed[i].length; j++) {
      const res = await Message.create({...messagesClosed[i][j], closed: true});
      // console.log(res);
    }
  }
  
  console.log('All messages generated.');
}

(async () => {
  await init();
  await mongoose.disconnect();
})();