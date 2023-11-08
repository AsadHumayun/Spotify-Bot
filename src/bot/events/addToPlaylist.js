import { addSongs } from '../addSongs.js';
import { EmbedBuilder } from 'discord.js';

export default {
	name: 'messageCreate',
	once: false,
	async execute(client, message) {
		if (message.channel.id !== client.config.CHANNELS.MUSIC || message.author.bot || message.webhookId) return;
		if (message.content.toLowerCase().startsWith('@bot-ignore'.toLowerCase())) return;
		const words = message.content.split('\n').join(' ').split(/ +/g);
		const songLinks = [];
		const correlationId = `${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;

		words.forEach((word) => {
			if (!word.startsWith('https://open.spotify.com/track/')) return;
			songLinks.push(word);
		});
		if (songLinks.length === 0) return;
		let returned;

		try {
			returned = await addSongs(message, songLinks, correlationId);
		}
		catch (e) {
			message.channel.send(`Sorry, an exception occurred :c\nexcpt: \`${e}\`\ncorrelation id: **$ ERR!!** ${correlationId} U:${message.author.id}`);
			client.channels.cache.get(client.config.CHANNELS.LOGS).send(`${Math.trunc(Date.now() / 60000)} > **$ ERR!!** ${correlationId}:\n\n\`${e.stack}\`\n\nsongLinks\n${songLinks.join('\n')}`);
		}

		if (message.SendResponses == false) return;

		let embed = new EmbedBuilder()
			.setColor('#5edaa8')
			.setTimestamp()
			.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
			.setFooter({ text: 'This message will be removed in 20 seconds' })
			.setDescription(
				`
successfully recorded **${returned.filter((r) => r[0] === 0).length}** entries.
[view playlist](https://open.spotify.com/playlist/${client.config.PLAYLIST_ID})

correlation id: $Cs-${correlationId}
				`,
			);

		if (returned.filter((r) => r[0] === 0).length === 0) {
			embed = embed.setDescription('The playlist already contains the songs that you have posted.\n\nIf you believe that you are seeing this message erroneously, please let Asad know.\n\ncorrelation id: $UNQ!! ' + correlationId);
			client.channels.cache.get(client.config.CHANNELS.LOGS).send(`${Math.trunc(Date.now() / 60000)} > **$ UNQ!!** ${correlationId} U:${message.author.id}\nsongLinks\n${songLinks.join('\n')}`);
		}

		const msg = await message.channel.send({
			embeds: [ embed ],
		});

		message.react('<:GigaChode:905554899733975090>');

		setTimeout(() => {
			msg.delete();
		}, 10_000);
	},
};
