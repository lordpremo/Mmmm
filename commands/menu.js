const { botName, ownerName, menuImage, prefix } = require("../config");

module.exports = {
  name: "menu",
  run: async (sock, msg, from, sender, args, command, db) => {
    const tag = "@" + sender.split("@")[0];
    const g = db.global;

    const caption = `
╔══════════════════════════════╗
║        ${botName}        ║
╠══════════════════════════════╣
║ Hello ${tag}                 
║ Owner: ${ownerName}          
╚══════════════════════════════╝

╭── OWNER ──╮
${prefix}owner
${prefix}public
${prefix}self
${prefix}mode

╭── GROUP ──╮
${prefix}tagall
${prefix}kick
${prefix}promote
${prefix}demote
${prefix}open
${prefix}close
${prefix}link
${prefix}resetlink
${prefix}antilink on/off
${prefix}antibadword on/off
${prefix}addbadword
${prefix}delbadword
${prefix}listbadword
${prefix}block
${prefix}unblock
${prefix}listblock

╭── SETTINGS ──╮
${prefix}alwaysonline on/off
${prefix}autotyping on/off
${prefix}autorecord on/off
${prefix}autoreact on/off
${prefix}autoviewstatus on/off
${prefix}autoread on/off
${prefix}settings

╭── TOOLS ──╮
${prefix}say
${prefix}fliptext
${prefix}genpass
${prefix}tinyurl
${prefix}vcc visa/mastercard/amex/jcb

╭── DOWNLOADER ──╮
${prefix}play
${prefix}ytmp3

╭── AI ──╮
${prefix}chatgpt
${prefix}mathgpt

[GLOBAL STATUS]
• AlwaysOnline: ${g.alwaysOnline}
• AutoTyping: ${g.autoTyping}
• AutoRecord: ${g.autoRecording}
• AutoReact: ${g.autoReact}
• AutoViewStatus: ${g.autoViewStatus}
• AutoRead: ${g.autoRead}
`;

    await sock.sendMessage(from, {
      image: { url: menuImage },
      caption,
      mentions: [sender]
    });
  }
};
