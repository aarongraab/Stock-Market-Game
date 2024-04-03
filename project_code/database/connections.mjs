import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'stockGame';
let client;
let db;

export async function connectToMongo() {
    client = new MongoClient(url);
    await client.connect();
    console.log('Connected successfully to server');
    db = client.db(dbName);
}

export async function closeConnection() {
    if (client) {
        await client.close();
        console.log('Database connection closed.');
    }
}

export const getDb = () => db;
