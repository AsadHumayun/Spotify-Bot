export default {
	name: 'imagine',
	aliases: ['imagine'],
	descriptor: 'A test command',
	async execute(message, args) {
		message.content = args.join(' ');
		message.client.emit('messageCreate', message);
	},
};
