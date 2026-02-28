const { ownerNumber, ownerName } = require("../config");

let mode = "public"; // public/self

module.exports = {
  getMode: () => mode,

  run: async (sock, msg, from, sender, args, command) => {
    const send = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });

    if (command === "owner") {
      return send(
        `👑 *BROKEN LORD OWNER*\n` +
          `• Name: ${ownerName}\n` +
          `• Number: wa.me/${ownerNumber}`
      );
    }

    if (!sender.includes(ownerNumber)) return;

    if (command === "public") {
      mode = "public";
      return send("✅ Mode: PUBLIC");
    }

    if (command === "self") {
      mode = "self";
      return send("✅ Mode: SELF (only owner)");
    }

    if (command === "mode") {
      return send(`ℹ️ Current mode: *${mode.toUpperCase()}*`);
    }
  }
};
