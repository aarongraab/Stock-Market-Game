// SET METHODS


// GET METHODS


// MUTATOR METHODS

import { getDb } from './connections.mjs';

export async function addPlayerVariables(gameId, players, startingCash) {
    try {
        const playerVariableDocuments = players.map(username => ({
            username,
            gameId,
            Cash: startingCash,
            profits: 0,
            transactions: [],
            stocksOwned: []
        }));
        await getDb().collection('PlayerVariables').insertMany(playerVariableDocuments);
        console.log(`Player variables initialized for the game.`);
    } catch (error) {
        console.error(`Error initializing player variables: ${error}`);
        throw error;
    }
}

export async function getCashValue(username) {
    const document = await getDb().collection('PlayerVariables').findOne({ username: username });
    return document ? document.Cash.toString() : "0"; 
}

export async function getProfits(username) { 
    const document = await getDb().collection('PlayerVariables').findOne({ username: username });
    return document ? document.profits.toString() : "0"; 
}
