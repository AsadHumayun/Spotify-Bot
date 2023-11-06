import { Channels } from '../../index.js';

export default {
	name: 'register',
	aliases: ['register'],
	async execute(message, args) {

		await Channels.create({
			id: args[0] || message.channel.id,
			postAccount: args[1] || message.author.id,
		})
			.catch((e) => {
				return message.channel.send(`An exception occurred :3\n\`\`\`${e}\n${e.stack}\`\`\``);
			});

		message.channel.send(`Successfully created object with Pk<${args[0] || message.channel.id}> postAccount<${args[1] || message.author.id}>`);
	},
};
