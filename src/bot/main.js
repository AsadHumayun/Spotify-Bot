import { join } from 'node:path';
import { readdirSync } from 'node:fs';
import { Collection } from 'discord.js';
import { Client, GatewayIntentBits, Options } from 'discord.js';
import { _ as config } from '../../config.js';

export async function createClient() {
	const client = new Client({
		makeCache: Options.cacheWithLimits({
			MessageManager: 100,
			GuildMemberManager: 100,
			PresenceManager: 0,
			GuildStickerManager: 0,
			GuildInviteManager: 0,
			GuildBanManager: 0,
		}),
		allowedMentions: {
			parse: [],
			repliedUser: false,
		},
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.MessageContent,
		],
	});

	client.config = config.BOT;
	client.commands = new Collection();

	const EVENTS_PATH = join(process.cwd(), 'src', 'bot', 'events');
	const eventFiles = readdirSync(EVENTS_PATH).filter(file => file.endsWith('.js'));
	console.info(`[EventHandler] Using events directory: ${EVENTS_PATH}`);

	for (const file of eventFiles) {
		const filePath = join(EVENTS_PATH, file);

		const { default: event } = await import('file:///' + filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(client, ...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(client, ...args));
		}
	}


	const COMMANDS_PATH = join(process.cwd(), 'src', 'bot', 'commands');
	const commandFiles = readdirSync(COMMANDS_PATH).filter(file => file.endsWith('.js'));
	console.info(`[CommandHandler] Using commands directory: ${COMMANDS_PATH}`);

	const START_TIME = Date.now();
	for (const file of commandFiles) {
		const filePath = 'file:///' + join(COMMANDS_PATH, file);
		const { default: command } = await import(filePath);
		client.commands.set(command.name, command);
	}

	console.info(`[CommandHandler] Successfully cached ${client.commands.size} commands in ${Date.now() - START_TIME} ms`);

	client.login(process.env.token);
}
