import { restClient } from '@polygon.io/client-js';
const rest = restClient("oTASnyzIZ0nstqluiICQBS22FaBMugM_");

// ticker and date must be passed in as strings
// date must be in format YYYY-MM-DD
export async function getStockPrice(ticker, date) {
    try {
        const data = await rest.stocks.aggregates(ticker, 1, "day", date, date);
        if (data.results && data.results.length > 0) {
            return data.results[0].c; // Return the closing price directly
        } else {
            return null; // Return null if no data is found
        }
    } catch (e) {
        console.error('An error happened:', e);
        return null; // Return null if an error occurs
    }
}

//console.log(await getStockPrice("AAPL", "2024-03-13"));


