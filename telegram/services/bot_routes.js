const message = require('./message');

const Chat = require('../models/chat');

const PER_PAGE = 3;

const ACTION = {
  'start': /\/start/,
  'getUsers': /\getUsers/,
  'CALLBACK': {
    'getMsg': 'get_msg',
    'getMore': 'get_more',
    'getMoreUser': 'get_more_user',
    'getActive': 'active',
    'getClosed': 'closed',
    'archived': 'archived',
    'menu': 'open_menu'
  }
};

module.exports = (bot) => {

  bot.onText(ACTION.start, async (msg, match) => {
    const chatId = msg.chat.id;
    mainMenu(chatId);
  });

  bot.onText(ACTION.getUsers, async (msg, match) => {
    const chatId = msg.chat.id;

    getUsers(chatId, false);
  });

  bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    if (action.startsWith(ACTION.CALLBACK.getMsg)) {
      const userId = action.slice(7);
      await Chat.updateStatus(chatId, userId, 0);

      getMessages(userId, chatId);
    } else if (action === ACTION.CALLBACK.getMore) {
      const status = await Chat.getCurrentStatus(chatId);
      const userId = status.userId;
      await Chat.updateStatus(chatId, userId, status.page + 1);

      getMessages(userId, chatId);
    } else if (action === ACTION.CALLBACK.getActive) {
      getUsers(chatId, false);
    } else if (action === ACTION.CALLBACK.getClosed) {
      getUsers(chatId, true);
    } else if (action === ACTION.CALLBACK.archived) {
      const status = await Chat.getCurrentStatus(chatId);
      updateDialogStatus(chatId, status.userId, !status.archived);
      mainMenu(chatId);
    } else if (action === ACTION.CALLBACK.menu) {
      mainMenu(chatId);
    } else if (action === ACTION.CALLBACK.getMoreUser) {
      const status = await Chat.getCurrentStatus(chatId);
      getUsers(chatId, status.archived);
    }

    await bot.answerCallbackQuery(callbackQuery.id);
    await bot.editMessageReplyMarkup({}, { chat_id: chatId, message_id: msg.message_id });

  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(msg.reply_to_message) {
      return;
    }

    const status = await Chat.getCurrentStatus(chatId);

    if (text.startsWith('/')) return;

    if (!status.archived) {
      const result = await message.createMessage(status.userId, text);
      bot.sendMessage(chatId, '?????????????????? ?????????????? ????????????????????.');
    }
  });

  async function getMessages(userId, chatId) {

    const status = await Chat.getCurrentStatus(chatId);

    const { result, count } = await message.getMessageByUserId(userId, status.page, status.archived);

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '??????', callback_data: ACTION.CALLBACK.getMore }, {
            text: status.archived ? '?????????????? ????????????' : '?????????????????? ????????????',
            callback_data: ACTION.CALLBACK.archived
          }],
          [{
            text: '?? ????????',
            callback_data: ACTION.CALLBACK.menu
          }],
        ]
      })
    };

    const optsOnEnd = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{
            text: status.archived ? '?????????????? ????????????' : '?????????????????? ????????????',
            callback_data: ACTION.CALLBACK.archived
          }],
          [{
            text: '?? ????????',
            callback_data: ACTION.CALLBACK.menu
          }],
        ]
      })
    };

    const opts = {
      parse_mode: 'HTML'
    };

    const parsedData = message.parse(result.data)
    const [msg1, msg2, msg3] = parsedData;

    if (msg1) {
      const responce = await bot.sendMessage(chatId, msg1.text, opts).then((res => {
        bot.onReplyToMessage(chatId, res.message_id, async (msg) => {
          const text = msg.text;
          const userId = status.userId;
          const result = await message.createMessage(userId, text);
          bot.sendMessage(chatId, '?????????????????? ?????????????? ????????????????????.');
        });
      }));

    }
    if (msg2) {
      await bot.sendMessage(chatId, msg2.text, opts).then((res => {
        bot.onReplyToMessage(chatId, res.message_id, async (msg) => {
          const text = msg.text;
          const userId = status.userId;
          const result = await message.createMessage(userId, text);
          bot.sendMessage(chatId, '?????????????????? ?????????????? ????????????????????.');
        });
      }));
    }
    if (msg3) {
      await bot.sendMessage(chatId, msg3.text, count > (status.page + 1) * PER_PAGE ? { ...opts, ...options } : opts).then((res => {
        bot.onReplyToMessage(chatId, res.message_id, async (msg) => {
          const text = msg.text;
          const userId = status.userId;
          const result = await message.createMessage(userId, text);
          bot.sendMessage(chatId, '?????????????????? ?????????????? ????????????????????.');
        });
      }));
    }

    if (count <= (status.page + 1) * PER_PAGE) {
      await bot.sendMessage(chatId, '?????????? ??????????????', optsOnEnd);
    }
  }

  async function getUsers(chatId, archived = false) {
    const status = await Chat.getCurrentStatus(chatId);
    status.archived = archived;

    const responce = await message.getAllUsers(archived, status.page);

    await Chat.updateArchived(chatId, archived);

    const users = responce.data.result.users;
    const allCount = responce.data.result.count;

    if (users.length === 0) {
      await bot.sendMessage(chatId, '???????????????????????? ??????????????????????. ???????????????????? ??????????????.');
      mainMenu(chatId);
      return;
    }

    const keyboard = [];

    users.forEach((elem) => {
      keyboard.push([{
        text: `???????????????????????? ${elem}`,
        callback_data: `${ACTION.CALLBACK.getMsg}${elem}`
      }])
    });

    if (allCount > (status.page + 1) * PER_PAGE) {
      await Chat.updateStatus(chatId, 0, status.page + 1);
      keyboard.push([{
        text: '?????????????????? ??????',
        callback_data: ACTION.CALLBACK.getMoreUser
      }]);
    }

    const opts = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          ...keyboard,
          [{
            text: '??????????',
            callback_data: ACTION.CALLBACK.menu
          }]
        ]
      })
    }

    await bot.sendMessage(chatId, '?????????????? ?????????????????????????? ????????????????????????', opts);
  }

  async function mainMenu(chatId) {
    await resetStatus(chatId);
    const opts = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '??????????????', callback_data: ACTION.CALLBACK.getActive }],
          [{ text: '??????????', callback_data: ACTION.CALLBACK.getClosed }]
        ]
      })
    };

    await bot.sendMessage(chatId,
      '?????????????????? ?????????????????????? ?????????? ???????? ?????? ???????????? ?? ??????????????????.', opts);
  }

  async function updateDialogStatus(chatId, userId, archived) {
    await Promise.all([
      Chat.updateArchived(chatId, archived),
      resetStatus(chatId),
      message.updateMessages(userId, archived),
    ]);
  }

  async function resetStatus(chatId) {
    await Chat.updateStatus(chatId, '0', 0);
  }
}
