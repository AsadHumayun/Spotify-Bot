/**
 * Starts the database and defines models.
 */

import Sequelize from 'sequelize';
import { join } from 'node:path';

import { User } from './models/User.js';
import { Channel } from './models/Channel.js';

export async function initDb() {
	const sequelize = new Sequelize('database', 'user', 'password', {
		host: 'localhost',
		dialect: 'sqlite',
		storage: join(process.cwd(), 'database.sqlite'),
		logQueryParameters: true,
	});

	const Users = User(sequelize);
	const Channels = Channel(sequelize);

	if (process.argv.includes('--syncdb')) {
		// necessary to construct tables
		console.info('[Sequelize] Syncing database...');
		const start = Date.now();
		await sequelize.sync({ force: true });
		console.info(`[Sequelize] Successfully synced sequelize database in ${Date.now() - start} ms`);
	}

	return Object.freeze({
		sequelize,
		Users,
		Channels,
	});
}
