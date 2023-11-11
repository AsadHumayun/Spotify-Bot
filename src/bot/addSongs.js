import fetch from 'node-fetch';
import { reauth, Users, Channels } from '../index.js';

/**
 * Adds songs to the Spotify playlist in question, while checking for duplicates.
 * @param {import('discord.js').Message} message {@link https://discord.js.org/#/docs/main/stable/class/Message')}
 * @param {string[]} songLinks song links to add to the playlist
 * @param {string} correlationId correlation ID associated with the request (for logging purposes)
 * @returns {Promise<Array<number, string, string>>} number: status code, string: status message
 */
export async function addSongs(message, songLinks, correlationId) {
	/**
	 * [0]
	 * 1 = ERROR
	 * 0 = SUCCESS (for return value)
	 * [1]
	 * song link
	 * [2]
	 * Reason for denial
	 */
	const __return = [];
	songLinks = songLinks.map((s) => s.split('?si=')[0]);
	const channel = await Channels.findByPk(message.channel.id);
	if (!channel) throw new Error('Channel not found in database; please use ~register to create the resource.');
	const user = await Users.findByPk(channel.dataValues.postAccount);
	// First check for duplicates
	let response;
	try {
		response = await fetch('https://api.spotify.com/v1/playlists/' + message.client.config.PLAYLIST_ID, {
			headers: {
				'Authorization': 'Bearer ' + user.dataValues.spotifyAccessToken,
			},
			method: 'GET',
		});

		response = await response.json();

		if (response.error) {
			throw new Error(response.error.message);
		}

	}
	catch (e) {
		try {
			await reauth(user.dataValues.id);
			await user.reload();
			message.client.channels.cache.get(message.client.config.CHANNELS.LOGS).send(`${Math.trunc(Date.now() / 60000)} > **$ Prc!** (addSongs > reauth) ${correlationId} U:${message.author.id}`);
			response = await fetch('https://api.spotify.com/v1/playlists/' + message.client.config.PLAYLIST_ID, {
				headers: {
					'Authorization': 'Bearer ' + user.dataValues.spotifyAccessToken,
				},
				method: 'GET',
			});

			response = await response.json();
		}
		catch (error) {
			message.client.channels.cache.get(message.client.config.CHANNELS.LOGS).send(`${Math.trunc(Date.now() / 60000)} > **$ ERR!!** ${correlationId} U:${message.author.id}\nE: \`${error}\`.\nThis error occurred while refreshing an access token.`);
		}
	}
	const playlist = response;

	const toAdd = [];
	const songs = playlist.tracks.items.map((i) => i.track.external_urls.spotify);

	songLinks.forEach((song) => {
		if (songs.includes(song)) {
			__return.push([1, song, 'Song was not added to playlist because of config behavior `_global.config.BOT.__BEHAVIORS.ALLOW_DUPLICATES` has been set to false.']);
		}
		else {
			toAdd.push('spotify:track:' + song.split('/').pop().split('?')[0]);
		}
	});

	await fetch(`https://api.spotify.com/v1/playlists/${message.client.config.PLAYLIST_ID}/tracks?uris=${toAdd.join(',')}`, {
		method: 'POST',
		body: JSON.stringify({
			uris: toAdd,
			position: null,
		}),
		headers: {
			'Authorization': 'Bearer ' + user.dataValues.spotifyAccessToken,
			'Content-Type': 'application/json',
		},
	});

	toAdd.forEach((s) => {
		__return.push([0, s, 'Succcessful (201 Resource Ready)']);
	});

	return __return;
}
