import { restClient } from '@polygon.io/client-js';
const rest = restClient(process.env.POLY_API_KEY);

// https://polygon.io/docs/stocks/get_v3_trades__stockticker
rest.stocks.trades("HCP").then((data) => {
	console.log(data);
}).catch(e => {
	console.error('An error happened:', e);
});