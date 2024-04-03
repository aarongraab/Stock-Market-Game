import * as db from '../database/index.mjs';
import * as api from '../api.mjs';

const now = new Date();

export function AdminPageRoutes(app) { 
    //---ADMIN PAGE---
    app.get('/admin', async (req, res) => {
    try {
        const users = await db.getAllInGameFalseUsernames();
        return res.status(200).render('admin_page', { userList: users });
    } catch (error) {
        console.error('Error retrieving user list:', error);
        return res.status(500).send('Internal Server Error');
    }
    });

    app.post('/admin', async (req, res) => {
    try {
        // Extracting the data sent from the form
        const { gameName, startingCash, endDate, players } = req.body;
        const gameId = await db.createNewGame(players, gameName, startingCash, endDate);
        console.log('Game', gameId, 'created successfully');

        // Respond to the client with a success message and status code 200
        return res.status(200).json({ success: true, message: 'Game created successfully', gameId });
    } catch (error) {
        // If an error occurs, log the error and respond with a status code of 500
        console.error('Error creating game:', error);
        return res.status(500).json({ success: false, error: 'Failed to create game' });
    }
    });
}
