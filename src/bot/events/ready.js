import { reauth } from '../../index.js';

export default {
	name: 'ready',
	once: false,
	async execute(client) {
		console.info(`[Events:READY] Successfully logged in as ${client.user.tag} (${client.user.id})`);
		client.channels.cache.get(client.config.CHANNELS.LOGS).send(`${Math.trunc(Date.now() / 60000)} > ready`);

		console.log('Refreshing access token');
		client.channels.cache.get(client.config.CHANNELS.LOGS).send(`${Math.trunc(Date.now() / 60000)} > ready > **$ Prc!!** Refreshing acs token...`);
		try {
			await reauth(client.config.MAIN_USER);
			console.log('Refreshed access token');
			client.channels.cache.get(client.config.CHANNELS.LOGS).send(`${Math.trunc(Date.now() / 60000)} > ready > **$SaaS** Successfully refreshed acs token`);
		}
		catch (e) {
			client.channels.cache.get(client.config.CHANNELS.LOGS).send(`${Math.trunc(Date.now() / 60000)} > ready > **$ ERR!!** \`${e}\``);
		}
		setTimeout(async () => {
			await reauth(client.config.MAIN_USER);
		}, 1800000);
	},
};
