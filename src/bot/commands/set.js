'use strict';
import { EmbedBuilder } from '@discordjs/builders';
import { Users } from '../../index.js';


export default {
	name: 'set',
	aliases: ['set', 's'],
	description: 'sets a value with key `<key>` and value `<value>` in the database',
	usage: '<user: UserResolvable> <key: string> <...value: any>',
	async execute(message, args) {
		if (args.length < 3) return message.reply('You must specify a user, key and value.');
		const key = args[1];
		let val = args.slice(2).join(' ');
		if (val.startsWith('"') && (val.endsWith('"'))) {
			val = String(val).slice(1, -1).replace(/\n+/g, '');
		}
		else {
			if (!isNaN(val)) val = Number(val);
			if (val.toString().toLowerCase() == 'true') val = true;
			if (val.toString().toLowerCase() == 'false') val = false;
			try {
				val = JSON.parse(val);
			}
			catch (e) {
				// eslint-disable-line no-empty
			}
		}
		try {
			await Users.update({
				[key]: val,
			}, {
				where: {
					id: args[0],
				},
			}).then((res) => {
				if (res[0] == 0) {
					return message.reply({ content: 'Database value was not updated (most likely, no column by that name exists)', allowedMentions: { parse: [], repliedUser: true } });
				}
				message.reply(`Successfully set ${key} ${args[0]} as ${val}`);
			});
		}
		catch (e) {
			message.reply(`:slight_frown: An error occurred!\n\`${e}\``);
		}
	},
};
