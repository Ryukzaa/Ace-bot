const { isGoodByeOn, getGoodbye } = require('../lib/index');

async function handleLeaveEvent(sock, groupId, participants) {
    try {
        // Check if goodbye is enabled
        const enabled = await isGoodByeOn(groupId);
        if (!enabled) return;

        // Get custom goodbye text
        const customMessage = await getGoodbye(groupId);

        // Fetch group metadata once
        const metadata = await sock.groupMetadata(groupId);
        const groupName = metadata.subject || 'this group';

        for (const participant of participants) {
            try {
                const userId =
                    typeof participant === 'string'
                        ? participant
                        : participant?.id;

                if (!userId) continue;

                const username = userId.split('@')[0];

                // Build message
                let finalMessage;
                if (customMessage) {
                    finalMessage = customMessage
                        .replace(/{user}/gi, `@${username}`)
                        .replace(/{group}/gi, groupName);
                } else {
                    finalMessage = `👋 @${username} has left *${groupName}*`;
                }

                await sock.sendMessage(groupId, {
                    text: finalMessage,
                    mentions: [userId]
                });
            } catch (userError) {
                console.error('Goodbye error (user):', userError);
            }
        }
    } catch (err) {
        console.error('Goodbye handler error:', err);
    }
}

module.exports = { handleLeaveEvent };