import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from "@adiwajshing/baileys";
import path from "path";
import { connectedUsers, saveConnectedUsers } from "./storage.js";
import handleWACommand from "./case.js";

export async function connectToWhatsApp(bot, chatId, phoneNumber) {
  try {
    const sessionPath = path.join(process.cwd(), `sessions/${chatId}`);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        connectedUsers[chatId] = sessionPath;
        saveConnectedUsers();
        bot.telegram.sendMessage(chatId, "✅ WhatsApp connected!");
      }

      if (connection === "close") {
        if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
          delete connectedUsers[chatId];
          saveConnectedUsers();
          bot.telegram.sendMessage(chatId, "⚠️ Logged out. Use /pair again.");
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);

    // 🔹 Send pairing code instead of QR
    if (!sock.authState.creds.registered) {
      if (!phoneNumber) {
        return bot.telegram.sendMessage(
          chatId,
          "❌ You must provide your WhatsApp number.\n\nUsage: /pair 2547xxxxxxx"
        );
      }
      const code = await sock.requestPairingCode(phoneNumber);
      bot.telegram.sendMessage(
        chatId,
        `📲 Your WhatsApp Pairing Code:\n\n\`${code}\`\n\n👉 Enter this in WhatsApp > Linked Devices > Link with phone number`,
        { parse_mode: "Markdown" }
      );
    }

    // Handle WhatsApp messages
    sock.ev.on("messages.upsert", async (msg) => {
      const m = msg.messages[0];
      if (!m.message || m.key.fromMe) return;
      let text = m.message.conversation || m.message.extendedTextMessage?.text || "";
      if (text.startsWith("!")) {
        await handleWACommand(sock, m, text.slice(1).trim());
      }
    });

  } catch (err) {
    bot.telegram.sendMessage(chatId, "❌ WhatsApp error.");
    console.error(err);
  }
}
