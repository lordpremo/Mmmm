module.exports = {
  run: async (sock, msg, from, sender, args, command, db, groupData) => {
    const send = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });

    const isGroup = from.endsWith("@g.us");
    if (!isGroup) return send("❌ Hii command ni ya group tu.");

    const meta = await sock.groupMetadata(from);
    const isAdmin = meta.participants.find((p) => p.id === sender)?.admin;
    const isBotAdmin = meta.participants.find((p) => p.id === sock.user.id)?.admin;

    if (!db.groups[from]) {
      db.groups[from] = {
        antilink: false,
        antibadword: false,
        badwords: [],
        blocked: []
      };
    }
    const g = db.groups[from];

    // basic group admin commands
    if (["tagall", "kick", "promote", "demote", "open", "close", "link", "resetlink"].includes(command)) {
      if (!isAdmin) return send("❌ Hii ni ya admin tu.");

      if (command === "tagall") {
        const text = args.join(" ") || "TAGALL";
        let mentions = meta.participants.map((p) => p.id);
        let list = meta.participants.map((p) => "@" + p.id.split("@")[0]).join(" ");
        return sock.sendMessage(
          from,
          { text: text + "\n\n" + list, mentions },
          { quoted: msg }
        );
      }

      if (command === "kick") {
        if (!isBotAdmin) return send("❌ Bot sio admin.");
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return send("⚙️ Tumia: .kick @user");
        await sock.groupParticipantsUpdate(from, [target], "remove");
        return;
      }

      if (command === "promote") {
        if (!isBotAdmin) return send("❌ Bot sio admin.");
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return send("⚙️ Tumia: .promote @user");
        await sock.groupParticipantsUpdate(from, [target], "promote");
        return;
      }

      if (command === "demote") {
        if (!isBotAdmin) return send("❌ Bot sio admin.");
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return send("⚙️ Tumia: .demote @user");
        await sock.groupParticipantsUpdate(from, [target], "demote");
        return;
      }

      if (command === "open") {
        await sock.groupSettingUpdate(from, "not_announcement");
        return send("✅ Group imefunguliwa.");
      }

      if (command === "close") {
        await sock.groupSettingUpdate(from, "announcement");
        return send("✅ Group imefungwa.");
      }

      if (command === "link") {
        const code = await sock.groupInviteCode(from);
        return send("🔗 Group link:\nhttps://chat.whatsapp.com/" + code);
      }

      if (command === "resetlink") {
        await sock.groupRevokeInvite(from);
        const code = await sock.groupInviteCode(from);
        return send("♻️ Link mpya:\nhttps://chat.whatsapp.com/" + code);
      }
    }

    // protections
    if (["antilink", "antibadword", "addbadword", "delbadword", "listbadword"].includes(command)) {
      if (!isAdmin) return send("❌ Hii ni ya admin tu.");

      if (command === "antilink") {
        const opt = (args[0] || "").toLowerCase();
        if (!["on", "off"].includes(opt)) return send("⚙️ Tumia: .antilink on/off");
        g.antilink = opt === "on";
        return send(`✅ ANTILINK: ${g.antilink ? "ON" : "OFF"}`);
      }

      if (command === "antibadword") {
        const opt = (args[0] || "").toLowerCase();
        if (!["on", "off"].includes(opt)) return send("⚙️ Tumia: .antibadword on/off");
        g.antibadword = opt === "on";
        return send(`✅ ANTIBADWORD: ${g.antibadword ? "ON" : "OFF"}`);
      }

      if (command === "addbadword") {
        const word = args.join(" ").toLowerCase();
        if (!word) return send("⚙️ Tumia: .addbadword neno");
        if (!g.badwords.includes(word)) g.badwords.push(word);
        return send(`✅ Neno limeongezwa: ${word}`);
      }

      if (command === "delbadword") {
        const word = args.join(" ").toLowerCase();
        if (!word) return send("⚙️ Tumia: .delbadword neno");
        g.badwords = g.badwords.filter((w) => w !== word);
        return send(`✅ Neno limeondolewa: ${word}`);
      }

      if (command === "listbadword") {
        if (!g.badwords.length) return send("ℹ️ Hakuna badwords.");
        return send("📜 BADWORDS:\n- " + g.badwords.join("\n- "));
      }
    }

    // block system
    if (["block", "unblock", "listblock"].includes(command)) {
      if (!isAdmin) return send("❌ Hii ni ya admin tu.");

      g.blocked = g.blocked || [];

      if (command === "block") {
        const target =
          msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
          args[0]?.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        if (!target) return send("⚙️ Tumia: .block @user / number");
        if (!g.blocked.includes(target)) g.blocked.push(target);
        return send("✅ User ameblockiwa kwenye group.");
      }

      if (command === "unblock") {
        const target =
          msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
          args[0]?.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        if (!target) return send("⚙️ Tumia: .unblock @user / number");
        g.blocked = g.blocked.filter((x) => x !== target);
        return send("✅ User ameondolewa kwenye block list.");
      }

      if (command === "listblock") {
        if (!g.blocked.length) return send("ℹ️ Hakuna blocked users.");
        const list = g.blocked.map((x) => "• @" + x.split("@")[0]).join("\n");
        return sock.sendMessage(
          from,
          { text: "🚫 BLOCK LIST:\n" + list, mentions: g.blocked },
          { quoted: msg }
        );
      }
    }
  }
};
