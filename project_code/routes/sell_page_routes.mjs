import * as db from '../database/index.mjs';
import * as api from '../api.mjs';

const now = new Date();

export function SellPageRoutes(app) { 
    //---SELL PAGE---
    app.get('/sell/:username', (req, res) => {
    const username = req.params.username;
    // Optionally, fetch any necessary data using the username
    return res.status(200).render('sell_page', { username }); // Pass the username to your buy_page template
    });
}