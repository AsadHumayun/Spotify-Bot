import { addSongs } from '../addSongs.js';
import { EmbedBuilder } from 'discord.js';

export default {
	name: 'messageCreate',
	once: false,
	async execute(client, message) {
		if (message.channel.id !== client.config.CHANNELS.MUSIC || message.author.bot || message.webhookId) return;

		const words = message.content.replace(/\n/gi, '').split(/ +/g);
		const songLinks = [];

		words.forEach((word) => {
			if (!word.startsWith('https://open.spotify.com/track/')) return;
			songLinks.push(word);
		});

		if (songLinks.length === 0) return;

		const returned = await addSongs(message, songLinks);
		message.react('✅');

		if (message.SendResponses == false) return;
		const msg = await message.channel.send({
			embeds: [
				new EmbedBuilder()
					.setTimestamp()
					.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
					.setDescription('- ' + returned.map((r) => r[0] === 0 ? `Successfully added ${r[1]} to playlist` : `${r[1]}:  ${r[2]}`).join('\n- ')),
			],
		});

		setTimeout(() => {
			msg.delete();
		}, 10_000);
	},
};
