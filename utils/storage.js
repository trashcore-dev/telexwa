import fs from "fs";
import path from "path";

const STORAGE_FILE = path.join(process.cwd(), "connectedUsers.json");
let connectedUsers = {};

export function loadConnectedUsers() {
  if (fs.existsSync(STORAGE_FILE)) {
    connectedUsers = JSON.parse(fs.readFileSync(STORAGE_FILE));
  }
}

export function saveConnectedUsers() {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(connectedUsers, null, 2));
}

export { connectedUsers };
