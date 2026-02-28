const axios = require("axios");

module.exports = {
  run: async (sock, msg, from, sender, args, command) => {
    const send = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });

    if (command === "play") {
      const query = args.join(" ");
      if (!query) return send("⚙️ Tumia: .play jina la wimbo");

      try {
        const res = await axios.get(
          "https://api-v1-2025.vercel.app/api/ytmp3?text=" + encodeURIComponent(query)
        );

        if (!res.data.status) return send("❌ Hakuna matokeo.");

        await sock.sendMessage(
          from,
          {
            audio: { url: res.data.result.url },
            mimetype: "audio/mpeg",
            fileName: res.data.result.title + ".mp3"
          },
          { quoted: msg }
        );
      } catch (e) {
        return send("❌ Error kupakua audio.");
      }
    }

    if (command === "ytmp3") {
      const url = args[0];
      if (!url || !url.startsWith("http"))
        return send("⚙️ Tumia: .ytmp3 https://youtube.com/...");

      try {
        const res = await axios.get(
          "https://api-v1-2025.vercel.app/api/ytmp3?url=" + encodeURIComponent(url)
        );

        if (!res.data.status) return send("❌ Hakuna matokeo.");

        await sock.sendMessage(
          from,
          {
            audio: { url: res.data.result.url },
            mimetype: "audio/mpeg",
            fileName: res.data.result.title + ".mp3"
          },
          { quoted: msg }
        );
      } catch (e) {
        return send("❌ Error kupakua audio.");
      }
    }
  }
};
