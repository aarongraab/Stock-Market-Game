import { getDb } from './connections.mjs';

import * as GamePlayers from './gamePlayers.mjs';
import * as Games from './games.mjs';
import * as PlayerVariables from './playerVariables.mjs';
import * as Transactions from './transactions.mjs';
import * as Users from './users.mjs';

// ***SET METHODS***


// ***GET METHODS***


// ***MUTATOR METHODS***
export async function deleteDocumentsInCollection(collectionName) {
    try {
        const result = await getDb().collection(collectionName).deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from the ${collectionName} collection.`);
    } catch (error) {
        console.error(`Error deleting documents from the ${collectionName} collection: ${error}`);
        throw error;
    }
}