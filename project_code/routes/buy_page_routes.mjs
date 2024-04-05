import * as db from '../database/index.mjs';
import * as api from '../api.mjs';

const now = new Date();

export function BuyPageRoutes(app) { 
    // Default
    app.get('/buy/:username', (req, res) => {
    const username = req.params.username;
    res.status(200).render('buy_page', { username }); 
    });

    //API Call for ticker price check
    app.get('/api/check-price', async (req, res) => {
    const ticker = req.query.ticker;
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    // Adjust for timezone offset to ensure correct date regardless of the local time zone
    const offset = yesterday.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const adjustedDate = new Date(yesterday.getTime() - offset);
    
    // Format as "YYYY-MM-DD"
    const formattedDate = adjustedDate.toISOString().split('T')[0];

    console.log(ticker);
    console.log(formattedDate);
    const stockPrice = await api.getStockPrice(ticker, formattedDate);
    console.log("Stock Price is:", stockPrice);

    if (stockPrice == null) {
        console.log("Overused API calls, try again in a minute. OR Trying to trade on a weekend or outside trading hours.");
        res.json({ success: false, error: 'Trading is not possible right now. Please try during trading hours.' });
        return;
    }
    try {
        // Assuming stockPrice is defined and has the value you want to send back
        if (stockPrice == null) {
            // Handle the case where stockPrice wasn't successfully retrieved
            throw new Error('Stock price is null');
        }

        // Send the stockPrice back to the client
        return res.status(200).json({ success: true, price: stockPrice });
    } catch (error) {
        console.error('Failed to process stock price:', error);
        // Sending back a more generic error message to the client for any failure
        return res.status(500).json({ success: false, error: 'Failed to process stock price' });
    }
    });

    app.get('/get-cash/:username', async (req, res) => {
        const username = req.params.username;
        try {
            const cashAvailable = await db.getCashValue(username);
            res.status(200).json({ success: true, cashAvailable });
        } catch (error) {
            console.error(`Error fetching cash value for ${username}:`, error);
            res.status(500).json({ success: false, message: "Failed to fetch cash value." });
        }
    });    

    app.post('/buy-stock', async (req, res) => {
        const { stockTicker, quantity, totalCost, username } = req.body;
        const buy = 'BUY';
    
        try {
            if (totalCost == 0) {
                res.status(500).json({ success: false, message: "Please check price of stock before purchase." });
                return;
            }
            const hasEnough = await db.checkBalance(username, totalCost);
            if (!hasEnough) {
                console.error(`Purchase failed for ${username}: Not enough cash to buy ${quantity} of ${stockTicker}`);
                res.status(500).json({ success: false, message: "Not enough funds in cash account, aka you poor." });
                return; 
            }
            await db.updatePlayerVariables(username, stockTicker, quantity, totalCost);
            await db.logTransaction(username, buy, stockTicker, quantity, totalCost);
            console.log(`Stock ${stockTicker} purchased successfully`);
            res.status(200).json({ success: true, message: "Purchase successful." });

        } catch (error) {
            console.error(`Purchase failed for ${username}: ${error}`);
            res.status(500).json({ error: "An error occurred during the purchase process." });
        }
    });
    

}