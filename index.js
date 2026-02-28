const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const P = require("pino");
const express = require("express");
const path = require("path");
const { botName, port, prefix, ownerNumber, globalSettings } = require("./config");

// commands
const menuCmd = require("./commands/menu");
const downloaderCmd = require("./commands/downloader");
const aiCmd = require("./commands/ai");
const ownerCmd = require("./commands/owner");
const groupCmd = require("./commands/group");
const toolsCmd = require("./commands/tools");
const settingsCmd = require("./commands/settings");

let sock;
let db = {
  groups: {},
  global: {
    ...globalSettings
  }
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    version,
    printQRInTerminal: false,
    browser: ["BROKEN LORD MD", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") console.log(`${botName} connected successfully!`);
    if (connection === "close") {
      console.log("Connection closed, reconnecting...");
      startBot();
    }
  });

  // auto view status
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    try {
      const msg = messages[0];
      if (!msg) return;

      // auto view status
      if (db.global.autoViewStatus && msg.key.remoteJid === "status@broadcast") {
        await sock.readMessages([msg.key]);
      }

      if (!msg.message) return;

      const from = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;

      // auto read
      if (db.global.autoRead && from !== "status@broadcast") {
        await sock.readMessages([msg.key]);
      }

      // ignore if no text
      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        "";

      const text = body.trim();
      if (!text.startsWith(prefix)) return;

      const args = text.slice(prefix.length).trim().split(/\s+/);
      const command = args.shift().toLowerCase();

      // owner mode check
      const mode = ownerCmd.getMode();
      if (mode === "self" && !sender.includes(ownerNumber)) {
        if (!["menu", "help"].includes(command)) return;
      }

      // ensure group db
      if (from.endsWith("@g.us") && !db.groups[from]) {
        db.groups[from] = {
          antilink: false,
          antibadword: false,
          badwords: [],
          blocked: []
        };
      }

      const groupData = db.groups[from] || null;

      // auto typing / recording
      if (db.global.autoTyping) {
        await sock.sendPresenceUpdate("composing", from);
      } else if (db.global.autoRecording) {
        await sock.sendPresenceUpdate("recording", from);
      } else if (db.global.alwaysOnline) {
        await sock.sendPresenceUpdate("available", from);
      }

      // auto react (simple)
      if (db.global.autoReact) {
        try {
          await sock.sendMessage(from, {
            react: { text: "⚡", key: msg.key }
          });
        } catch {}
      }

      // route commands
      if (["menu", "help"].includes(command)) {
        return menuCmd.run(sock, msg, from, sender, args, command, db);
      }

      if (["owner", "public", "self", "mode"].includes(command)) {
        return ownerCmd.run(sock, msg, from, sender, args, command, db);
      }

      if (
        [
          "tagall",
          "kick",
          "promote",
          "demote",
          "open",
          "close",
          "link",
          "resetlink",
          "antilink",
          "antibadword",
          "addbadword",
          "delbadword",
          "listbadword",
          "block",
          "unblock",
          "listblock"
        ].includes(command)
      ) {
        return groupCmd.run(sock, msg, from, sender, args, command, db, groupData);
      }

      if (["play", "ytmp3"].includes(command)) {
        return downloaderCmd.run(sock, msg, from, sender, args, command);
      }

      if (["chatgpt", "mathgpt"].includes(command)) {
        return aiCmd.run(sock, msg, from, sender, args, command);
      }

      if (["vcc", "say", "fliptext", "genpass", "tinyurl"].includes(command)) {
        return toolsCmd.run(sock, msg, from, sender, args, command);
      }

      if (
        [
          "alwaysonline",
          "autotyping",
          "autorecord",
          "autoreact",
          "autoviewstatus",
          "autoread",
          "settings"
        ].includes(command)
      ) {
        return settingsCmd.run(sock, msg, from, sender, args, command, db);
      }
    } catch (e) {
      console.log("MSG ERROR:", e);
    }
  });
}

async function startWeb() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "web")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "web/index.html"));
  });

  app.post("/api/pair", async (req, res) => {
    try {
      const { number } = req.body;
      if (!number) return res.status(400).json({ error: "number required" });
      if (!sock) return res.status(500).json({ error: "bot not ready" });

      const code = await sock.requestPairingCode(number);
      return res.json({ code });
    } catch (e) {
      console.log("PAIR ERROR:", e);
      return res.status(500).json({ error: "failed to generate code" });
    }
  });

  app.listen(port, () =>
    console.log(`🌐 Pair web running on http://localhost:${port}`)
  );
}

startBot();
startWeb();
