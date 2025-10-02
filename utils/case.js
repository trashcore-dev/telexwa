export default async function handleWACommand(sock, m, commandText) {
  const [command, ...args] = commandText.split(" ");

  switch (command.toLowerCase()) {
    case "ping":
      await sock.sendMessage(m.key.remoteJid, { text: "🏓 Pong from WhatsApp!" });
      break;

    case "echo":
      await sock.sendMessage(m.key.remoteJid, { text: args.join(" ") || "❌ Usage: !echo hello" });
      break;

    default:
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Unknown command." });
  }
}
