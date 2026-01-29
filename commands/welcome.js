const { isWelcomeOn, getWelcome } = require('../lib/index');
const { channelInfo } = require('../lib/messageConfig');

async function handleJoinEvent(sock, groupId, participants) {
    try {
        if (!(await isWelcomeOn(groupId))) return;

        const customMessage = await getWelcome(groupId);

        // Fetch metadata ONCE
        const metadata = await sock.groupMetadata(groupId);
        const groupName = metadata.subject || 'this group';
        const memberCount = metadata.participants.length;

        // Prepare users
        const mentions = [];
        const users = [];

        for (const p of participants) {
            const id = typeof p === 'string' ? p : p?.id;
            if (!id) continue;
            mentions.push(id);
            users.push(`@${id.split('@')[0]}`);
        }

        if (!users.length) return;

        // Default MEME message
        const defaultMessage = `
╭─🔥 *NEW VICTIM DETECTED* 🔥─╮
│ 😈 ${users.join(', ')}
│ 📍 Group: *${groupName}*
│ 👥 Members: *${memberCount}*
╰────────────────────────╯

⚠️ *Rules:*  
• No spam  
• No drama  
• Respect everyone  

💀 Good luck. You’ll need it.
        `.trim();

        // Build final message
        const finalMessage = customMessage
            ? customMessage
                .replace(/{user}/gi, users.join(', '))
                .replace(/{group}/gi, groupName)
                .replace(/{count}/gi, memberCount)
            : defaultMessage;

        await sock.sendMessage(groupId, {
            text: finalMessage,
            mentions,
            ...channelInfo
        });

    } catch (err) {
        console.error('FAST WELCOME ERROR:', err);
    }
}

module.exports = { handleJoinEvent };
