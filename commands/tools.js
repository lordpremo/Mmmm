const axios = require("axios");

module.exports = {
  run: async (sock, msg, from, sender, args, command) => {
    const send = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });

    if (command === "say") {
      const text = args.join(" ");
      if (!text) return send("⚙️ Tumia: .say maneno");
      return send(text);
    }

    if (command === "fliptext") {
      const text = args.join(" ");
      if (!text) return send("⚙️ Tumia: .fliptext maneno");
      return send(text.split("").reverse().join(""));
    }

    if (command === "genpass") {
      const len = parseInt(args[0]) || 12;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let pass = "";
      for (let i = 0; i < len; i++) pass += chars[Math.floor(Math.random() * chars.length)];
      return send("🔐 Password:\n" + pass);
    }

    if (command === "tinyurl") {
      const url = args[0];
      if (!url || !url.startsWith("http")) return send("⚙️ Tumia: .tinyurl https://link");
      try {
        const res = await axios.get(
          "https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url)
        );
        return send("🔗 Short URL:\n" + res.data);
      } catch {
        return send("❌ Imeshindikana kufupisha link.");
      }
    }

    if (command === "vcc") {
      const type = (args[0] || "").toLowerCase();
      if (!["visa", "mastercard", "amex", "jcb"].includes(type))
        return send("⚙️ Tumia: .vcc visa/mastercard/amex/jcb");
      const num = "4" + Math.random().toString().slice(2, 16);
      return send(`💳 Fake ${type.toUpperCase()} VCC:\n${num}\nMM/YY: 12/29\nCVV: 123`);
    }
  }
};
