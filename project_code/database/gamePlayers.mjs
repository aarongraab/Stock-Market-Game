// SET METHODS


// GET METHODS


// MUTATOR METHODS

import { getDb } from './connections.mjs';

export async function addGamePlayers(gameId, players) {
    try {
        const playerDocuments = players.map(username => ({ gameId, username }));
        await getDb().collection('GamePlayers').insertMany(playerDocuments);
        console.log(`Players added to the game.`);
    } catch (error) {
        console.error(`Error adding players to the game: ${error}`);
        throw error;
    }
}