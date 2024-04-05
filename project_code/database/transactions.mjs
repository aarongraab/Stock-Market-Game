import { getDb } from './connections.mjs';

import * as GamePlayers from './gamePlayers.mjs';
import * as Games from './games.mjs';
import * as PlayerVariables from './playerVariables.mjs';
import * as Transactions from './transactions.mjs';
import * as Users from './users.mjs';

// SET METHODS


// GET METHODS


// MUTATOR METHODS 
export async function logTransaction(username, transactionType, stockTicker, quantity, totalCost) {
    const quantityInt = parseInt(quantity, 10);
    // Log the transaction
    await getDb().collection('Transactions').insertOne({
        username,
        transactionType,
        stockTicker,
        quantity: quantityInt,
        totalCost,
        date: new Date()
    });
}
