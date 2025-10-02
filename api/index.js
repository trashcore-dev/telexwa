import { Telegraf } from "telegraf";
import { loadConnectedUsers, saveConnectedUsers, connectedUsers } from "../utils/storage.js";
import { connectToWhatsApp } from "../utils/whatsapp.js";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Load saved sessions
loadConnectedUsers();

bot.on("text", async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;
  if (!text.startsWith("/")) return;

  const args = text.split(" ");
  const command = args.shift().slice(1);

  switch (command) {
    case "start":
      await ctx.reply("👋 Welcome! Use /help to see commands.");
      break;

    case "help":
      await ctx.reply(`
📖 Commands:
/start - Start bot
/help - Show menu
/pair <phone> - Pair WhatsApp
/delpair - Unlink WhatsApp
/listpaired - Show paired accounts
/ping - Latency test
      `);
      break;

    case "ping":
      await ctx.reply("🏓 Pong!");
      break;

    case "pair":
      if (connectedUsers[chatId]) {
        return ctx.reply("⚠️ Already paired.");
      }
      if (!args[0]) {
        return ctx.reply("❌ Usage: /pair <phoneNumber>\nExample: /pair 254712345678");
      }
      await ctx.reply("📲 Generating WhatsApp pairing code...");
      connectToWhatsApp(bot, chatId, args[0]);
      break;

    case "listpaired":
      if (connectedUsers[chatId]) {
        await ctx.reply(`🔗 Paired with WhatsApp session: ${connectedUsers[chatId]}`);
      } else {
        await ctx.reply("❌ Not paired.");
      }
      break;

    case "delpair":
      if (connectedUsers[chatId]) {
        delete connectedUsers[chatId];
        saveConnectedUsers();
        await ctx.reply("🗑️ WhatsApp unlinked.");
      } else {
        await ctx.reply("❌ No active session.");
      }
      break;

    default:
      await ctx.reply("❌ Unknown command.");
  }
});

// Vercel webhook handler
export default async function handler(req, res) {
  if (req.method === "POST") {
    await bot.handleUpdate(req.body);
    res.status(200).send("OK");
  } else {
    res.status(200).send("Bot is running.");
  }
}
