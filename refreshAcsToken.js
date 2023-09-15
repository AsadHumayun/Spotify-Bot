import { reauth } from './src/index.js';

console.log('Refresh access token timer set');
setTimeout(async () => {
	await reauth();
}, 1800000);
