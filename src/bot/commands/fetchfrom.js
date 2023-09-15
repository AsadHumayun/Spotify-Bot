export default {
	name: 'fetchfrom',
	aliases: ['fetchfrom'],
	descriptor: 'A test command',
	fetchMessagesAndEmitMessageEvent: async function(message, target = 100, afterMsgId) {
		if (target > 100) target = 100;

		const messages = await message.channel.messages.fetch({
			limit: target,
			cache: false,
			after: afterMsgId,
		});

		await messages.each((m) => {
			if (m.bot || m.webhookId) return;
			if (m.id === message.channel.lastMesaageId) return;
			m.SendResponses = false;
			message.client.emit('messageCreate', m);
		});
	},
	async execute(message, args) {
		if (!args.length || isNaN(args[1])) return message.reply('Params:\n`~fetchfrom <afterMsgId: Snowflake> <messages: number (max: 500)>`');
		const msgId = args[0];
		const target = Number(args[1]);
		if (target > 500) return message.reply('Please use a number less than 500');

		if (target >= 100) {
			const msg = await message.channel.send(`Emitting \`messageCreate\` for ${target} messages after ${msgId}...`);
			let i = 0;
			while (i < target) {
				await this.fetchMessagesAndEmitMessageEvent(message, 100, msgId);
				i += 100;
			}
			msg.edit(`Successfully emitted \`messageCreate\` for ${target} messages after ${msgId}.`);
		}
		else {
			const msg = await message.channel.send(`Emitting \`messageCreate\` for ${target} messages after ${msgId}...`);
			await this.fetchMessagesAndEmitMessageEvent(message, target, msgId);
			msg.edit(`Successfully emitted \`messageCreate\` for ${target} messages after ${msgId}.`);
		}
	},
};
