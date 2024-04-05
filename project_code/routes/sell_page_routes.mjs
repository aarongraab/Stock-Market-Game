import * as db from '../database/index.mjs';
import * as api from '../api.mjs';

const now = new Date();

export function SellPageRoutes(app) { 
    
    app.get('/sell/:username', (req, res) => {
    const username = req.params.username;
    // Optionally, fetch any necessary data using the username
    return res.status(200).render('sell_page', { username }); // Pass the username to your buy_page template
    });

    app.get('/get-stocks-owned/:username', async (req, res) => {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        
        try {
            const stocksOwned = await db.getStocksOwned(username);
            res.json(stocksOwned);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve stocks owned' });
        }
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
    
        const stockPrice = await api.getStockPrice(ticker, formattedDate);
        console.log(`Stock Price of ${ticker} on ${formattedDate} is ${stockPrice}`);
    
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

    app.get('/check-quantity', async (req, res) => {
        const { ticker, username, quantityToSell } = req.query; 
        try {
            if (await db.checkQuantity(username, ticker, parseInt(quantityToSell, 10))) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(200).json({ success: false });
            }
        } catch (error) {
            console.error('Failed to /check-quantity => sell_page_routes.mjs', error);
            res.status(500).json({ success: false, message: "Internal server error" }); 
        }
    });

    app.post('/sell-stock', async (req, res) => {
        const { stockTicker, quantityToSell, totalCost, username } = req.body;
        const sell = 'SELL';
        console.log('sell button pressed');
        try {
            try {
                await db.combineStocks(username, stockTicker);
                console.log('combinedStocks method succesful.');
            } catch (error) {
                console.error('Failed to combineStocks', error);
                res.status(500).json({ success: false, message: "Internal Server Error." }); 
            }
            try {
                await db.reduceQuantity(username, stockTicker, quantityToSell);
                console.log('reduceQuantity method successful.');
            } catch (error) {
                console.error('Failed to reduceQuantity', error);
                res.status(500).json({ success: false, message: "Internal Server Error." }); 
            }
            try {
                await db.removeZeroQuantityStocks(username);
                console.log('removeZeroQuantityStocks successful.');
            } catch (error) {
                console.error('Failed to removeZeroQuantityStocks', error);
                res.status(500).json({ success: false, message: "Internal Server Error." }); 
            }
            try {
                await db.logTransaction(username, sell, stockTicker, quantityToSell, totalCost);
                console.log('logTransaction successful.');
            } catch (error) {
                console.error('Failed to logTransaction', error);
                res.status(500).json({ success: false, message: "Internal Server Error." }); 
            }
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Failed somewhere in the try-catch calls.', error);
            res.status(500).json({ success: false, message: "Internal Server Error." });
        }
    });




}