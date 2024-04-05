import { getDb } from './connections.mjs';

import * as GamePlayers from './gamePlayers.mjs';
import * as Games from './games.mjs';
import * as PlayerVariables from './playerVariables.mjs';
import * as Transactions from './transactions.mjs';
import * as Users from './users.mjs';

// ***SET METHODS***
// Create a new game within the database - Collections: 'Games', 'GamePlayers', and 'PlayerVariables'
export async function createNewGame(players, gameName, startingCash, endDate) {
    // Retrieve the latest game ID from the 'Games' collection and calculate the next gameId
    let latestGame = await getDb().collection('Games').findOne({}, { sort: { gameId: -1 }, limit: 1 });
    let gameId = latestGame ? latestGame.gameId + 1 : 1;

    // Adding new game
    try {
        const newGame = { gameId, gameName, startingCash, endDate };
        await getDb().collection('Games').insertOne(newGame);
        console.log(`New game '${gameName}' created successfully.`);
    } catch (error) {
        console.error(`Error creating game: ${error}`);
        throw error;
    }
    // Call the new functions, passing necessary parameters
    await GamePlayers.addGamePlayers(gameId, players);
    for (const username of players) {
        await Users.changeInGame(username); // Keep this call if needed to update the inGame status of users
    }
    await PlayerVariables.addPlayerVariables(gameId, players, startingCash);

    return gameId; // Return the gameId for any further processing
}



// ***GET METHODS***
export async function checkDate(gameId) {
    try {
        const game = await getDb().collection('Games').findOne({ gameId: parseInt(gameId) });
        if (!game) {
            console.log('Game not found.');
            return false;
        }

        const endDate = new Date(game.endDate);
        endDate.setUTCHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        console.log("Comparing dates:", endDate.toUTCString(), "to", today.toUTCString());
        
        if (endDate.getTime() === today.getTime()) {
            console.log('Dates match.');
            return true;
        } else {
            console.log('Dates do not match.');
            return false;
        }
        } catch (error) {
            console.error('Error checking date:', error);
            return false;
        }
}



// ***MUTATOR METHODS***

