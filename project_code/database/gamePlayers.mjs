import { getDb } from './connections.mjs';

import * as GamePlayers from './gamePlayers.mjs';
import * as Games from './games.mjs';
import * as PlayerVariables from './playerVariables.mjs';
import * as Transactions from './transactions.mjs';
import * as Users from './users.mjs';


// ***SET METHODS***
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



// ***GET METHODS***


// ***MUTATOR METHODS***

