// SET METHODS


// GET METHODS


// MUTATOR METHODS

import { getDb } from './connections.mjs';
import { addGamePlayers } from './gamePlayers.mjs';
import { addPlayerVariables } from './playerVariables.mjs';
import { changeInGame } from './users.mjs';

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
    await addGamePlayers(gameId, players);
    for (const username of players) {
        await changeInGame(username); // Keep this call if needed to update the inGame status of users
    }
    await addPlayerVariables(gameId, players, startingCash);

    return gameId; // Return the gameId for any further processing
}
    /*
    // Retrieve the latest game ID from the 'Games' collection
    let latestGame = await getDb().collection('Games').findOne({}, { sort: { gameId: -1 }, limit: 1 });
    let gameId = latestGame ? latestGame.gameId + 1 : 1;

    // Create a game object
    const newGame = { gameId, gameName, startingCash, endDate };

    // Insert the game into the 'Games' collection
    try {
        await getDb().collection('Games').insertOne(newGame);
        console.log(`New game '${gameName}' created successfully.`);
    } catch (error) {
        console.error(`Error creating game: ${error}`);
        throw error;
    }

    // Create an array of player documents
    const playerDocuments = players.map(username => ({ gameId, username }));

    // Insert player documents into the 'GamePlayers' collection
    try {
        await getDb().collection('GamePlayers').insertMany(playerDocuments);
        console.log(`Players added to the game.`);
    } catch (error) {
        console.error(`Error adding players to the game: ${error}`);
        throw error;
    }

    // Updates inGame variable
    for (const username of players) {
        try {
            await changeInGame(username); 
        } catch (error) {
            console.error(`Error updating inGame status for ${username}: ${error}`);
        }
    }

    // Create an array of player variable documents
    const playerVariableDocuments = players.map(username => ({
        username,
        Cash: startingCash,
        profits: 0,
        transactions: [],
        stocksOwned: []
    }));

    // Insert player variable documents into the 'PlayerVariables' collection
    try {
        await getDb().collection('PlayerVariables').insertMany(playerVariableDocuments);
        console.log(`Player variables initialized for the game.`);
    } catch (error) {
        console.error(`Error initializing player variables: ${error}`);
        throw error;
    }
    return gameId;
    */

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


