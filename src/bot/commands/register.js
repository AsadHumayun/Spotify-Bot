import { Channels } from '../../index.js';

export default {
	name: 'register',
	aliases: ['register'],
	async execute(message, args) {

		await Channels.create({
			id: message.channel.id,
			postAccount: args[0] || message.author.id,
		})
			.catch((e) => {
				return message.channel.send(`An exception occurred :3\n\`\`\`${e}\n${e.stack}\`\`\``);
			});

		message.channel.send(`Successfully created object with Pk<${message.channel.id}> postAccount<${args[0] || message.author.id}>`);
	},
};
