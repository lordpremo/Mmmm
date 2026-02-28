module.exports = {
  run: async (sock, msg, from, sender, args, command, db) => {
    const send = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });

    const isOwner = sender.includes(require("../config").ownerNumber);
    if (!isOwner) return send("❌ Hii ni ya OWNER tu.");

    const g = db.global;

    const toggle = (key, val) => {
      g[key] = val;
      return send(`✅ ${key} set to: ${val}`);
    };

    if (command === "alwaysonline") {
      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) return send("⚙️ Tumia: .alwaysonline on/off");
      return toggle("alwaysOnline", opt === "on");
    }

    if (command === "autotyping") {
      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) return send("⚙️ Tumia: .autotyping on/off");
      return toggle("autoTyping", opt === "on");
    }

    if (command === "autorecord") {
      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) return send("⚙️ Tumia: .autorecord on/off");
      return toggle("autoRecording", opt === "on");
    }

    if (command === "autoreact") {
      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) return send("⚙️ Tumia: .autoreact on/off");
      return toggle("autoReact", opt === "on");
    }

    if (command === "autoviewstatus") {
      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) return send("⚙️ Tumia: .autoviewstatus on/off");
      return toggle("autoViewStatus", opt === "on");
    }

    if (command === "autoread") {
      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) return send("⚙️ Tumia: .autoread on/off");
      return toggle("autoRead", opt === "on");
    }

    if (command === "settings") {
      return send(
        `⚙️ GLOBAL SETTINGS\n` +
          `• alwaysOnline: ${g.alwaysOnline}\n` +
          `• autoTyping: ${g.autoTyping}\n` +
          `• autoRecording: ${g.autoRecording}\n` +
          `• autoReact: ${g.autoReact}\n` +
          `• autoViewStatus: ${g.autoViewStatus}\n` +
          `• autoRead: ${g.autoRead}\n`
      );
    }
  }
};
