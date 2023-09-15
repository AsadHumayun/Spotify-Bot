import express from 'express';
import fetch from 'node-fetch';
import { stringify } from 'querystring';
import { config } from 'dotenv';
import { initDb } from './db/init.js';
import './bot/main.js';
import { createClient } from './bot/main.js';

config();
const { sequelize, Users, Channels } = await initDb();

const client_id = process.env.CLIENT_ID;
const redirect_uri = process.env.redirect_uri;

const app = express();

process.on('uncaughtException', console.error);

app.get('/auth', function(req, res) {

	const state = req.query.userId;
	const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';

	res.redirect('https://accounts.spotify.com/authorize?' +
	new URLSearchParams({
		response_type: 'code',
		client_id,
		scope,
		redirect_uri,
		state,
	}));
});

app.get('/authorized', async function(req, res) {

	if (req.query.error) {
		return res.redirect('../e?e=' + req.query.error);
	}

	/** Special thanks to https://stackoverflow.com/questions/53218678/spotify-api-bad-request-on-api-token-authorization-error-400 */
	const result = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		body: `grant_type=authorization_code&code=${req.query.code}&redirect_uri=${redirect_uri}`,
		headers: {
			'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + process.env.CLIENT_SECRET).toString('base64')),
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	const data = await result.json();

	try {
		await Users.create({
			id: req.query.state,
			spotifyAccessToken: data.access_token,
			spotifyRefreshToken: data.refresh_token,
		});
	}
	catch (e) {
		return res.redirect('../e?e=' + e);
	}
	res.send(`Successfully linked ${req.query.state} to Spotify account and updated database. You may now close this window.`);
});

app.get('/reauth', async (req, res) => {
	const user = await Users.findByPk(req.query.userId);
	if (!user || !user.spotifyRefreshToken) {
		return res.redirect('../auth?userId=' + req.query.userId);
	}

	let result = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		body: `grant_type=refresh_token&refresh_token=${user.spotifyRefreshToken}&redirect_uri=${redirect_uri}`,
		headers: {
			'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + process.env.CLIENT_SECRET).toString('base64')),
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	result = await result.json();

	Users.update({
		spotifyAccessToken: result.access_token,
	}, {
		where: {
			id: req.query.userId,
		},
	});

	res.json({
		ok: true,
	})
		.status(200);

});

app.get('/e', function(req, res) {
	res.send(req.query.e);
});

app.listen(8888, () => {
	console.info('Server started');
});

createClient();

/**
 * Refreshes the Spotify access token of a user
 * @param {import('discord.js').Snowflake} userId Discord ID of the user whose Spotify access token needs to be refreshed
 * @returns {Promise<boolean>}
 */
async function reauth(userId) {
	const user = await Users.findByPk(userId);
	if (!user || !user.spotifyRefreshToken) {
		throw new Error('User not found or no refresh token found');
	}

	let result = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		body: `grant_type=refresh_token&refresh_token=${user.spotifyRefreshToken}&redirect_uri=${redirect_uri}`,
		headers: {
			'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + process.env.CLIENT_SECRET).toString('base64')),
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	result = await result.json();

	Users.update({
		spotifyAccessToken: result.access_token,
	}, {
		where: {
			id: userId,
		},
	});

	return true;
}

export { reauth, sequelize, Users, Channels };
