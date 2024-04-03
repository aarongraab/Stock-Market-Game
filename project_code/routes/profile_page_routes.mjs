import * as db from '../database/index.mjs';
import * as api from '../api.mjs';

const now = new Date();

export function ProfilePageRoutes(app) { 
    // Dynamic route for user profiles
    app.get('/profile/:username', async (req, res) => {
        const { username } = req.params;
        try {
            const cashValue = await db.getCashValue(username); 
            const profits = await db.getProfits(username); 
            
            res.status(200).render('profile_page', { username, cashValue, profits 
            });
        } catch (error) {
            console.error(error); 
            res.status(500).send('Error retrieving profile information');
        }
    });



}