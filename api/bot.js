import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const update = req.body;
    await bot.processUpdate(update);

    // Example command
    bot.onText(/\/start/, (msg) => {
      bot.sendMessage(msg.chat.id, `Hello, ${msg.from.first_name}!`);
    });

    return res.status(200).send('OK');
  } else {
    res.status(200).send('Telegram bot is running!');
  }
}
