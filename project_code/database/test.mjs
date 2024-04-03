// SET METHODS


// GET METHODS


// MUTATOR METHODS

import { getDb } from './connections.mjs';

export async function deleteDocumentsInCollection(collectionName) {
    try {
        const result = await getDb().collection(collectionName).deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from the ${collectionName} collection.`);
    } catch (error) {
        console.error(`Error deleting documents from the ${collectionName} collection: ${error}`);
        throw error;
    }
}