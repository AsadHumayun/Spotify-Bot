import { reauth } from './src/index.js';

export async function refreshAccessTokenLoop(uuid) {
	console.log('Refreshing access token');
	await reauth(uuid);
	console.log('Refreshed access token');
	setTimeout(async () => {
		await refreshAccessTokenLoop(uuid);
	}, 1800000);
}

export { refreshAccessTokenLoop }
