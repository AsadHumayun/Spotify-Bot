import { ChannelType } from 'discord.js';

export default {
	name: 'messageCreate',
	once: false,
	async execute(client, message) {
		if ([ChannelType.DM].includes(message.channel.type)) return;

		if (message.partial) message = await message.fetch().catch(() => {return;});
		if (message.author.bot || message.webhookId || !message) return;

		if (!message.content.startsWith(client.config.PREFIX)) return;

		const args = message.content.trim().slice(client.config.PREFIX.length, message.content.length).split(/ +/g);
		const commandName = args.shift();
		const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases?.includes(commandName));

		if (message.SendResponses == false || !command) return;

		try {
			command.execute(message, args);
		}
		catch (e) {
			message.reply(`An exception occurred :c\n\`${e}\``);
		}
	},
};
