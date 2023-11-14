export default {
	name: 'test',
	aliases: ['test', 't'],
	descriptor: 'A test command',
	async execute(message) {
		return message.reply(Math.trunc(Date.now() / 60000));
	},
};
