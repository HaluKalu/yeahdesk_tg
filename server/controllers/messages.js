const Messages = require('../models/message');

const PER_PAGE = 3;

module.exports.get = async (req, res, next) => {
  const query = req.query;
  const { userId } = query;
  let { page } = query;

  let skip = 0;
  if (page >= 0) {
    skip = page * PER_PAGE;
  } else {
    page = 0;
  }

  const messages = await Messages.find({ userId }).sort('-dateTime').skip(skip).limit(PER_PAGE);
  const count = await Messages.count({ userId });

  console.log(messages, count);

  res.json({ messages, count, page });
}

module.exports.create = async (req, res, next) => {
  const body = req.body;
  const { text, userId, messageType } = body;

  const obj = {};

  if (!text) {
    return res.json({ 'error': 'Field text is required' });
  }
  obj.text = text;

  if (!userId) {
    return res.json({ 'error': 'Field userId is required' });
  }
  obj.userId = userId;

  if (messageType) {
    obj.messageType = messageType.toUpperCase();
  }


  const time = new Date();

  obj.dateTime = time;

  const result = await Messages.create({ ...obj });

  res.json({ result });
}

module.exports.getAllUsers = async (req, res, next) => {
  const query = req.query;
  const { archived: closed, page } = query;
  let skip = 0;

  if(page) {
    skip = page * PER_PAGE;
  }
  
  const users = await Messages.find({ closed }, { 'userId': 1, "_id": 0 });
  const objToArr = users.map((e) => e.userId);
  const uniqueUsers = [...new Set(objToArr)];
  const count = uniqueUsers.length;
  const usersPaginated = uniqueUsers.slice(skip, skip + PER_PAGE);
  console.log(`List of users: ${usersPaginated}, Count of all users: ${count}`)

  res.json({
    result: {
      users: usersPaginated,
      count
    }
  });
}

module.exports.update = async (req, res, next) => {
  const body = req.body;
  const { userId, archived } = body;

  const result = await Messages.updateMany({ userId }, { closed: archived });
  res.json({ result });

}