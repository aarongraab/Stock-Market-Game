import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'stockGame';
let db;

export async function connectToMongo() {
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected successfully to server');
    db = client.db(dbName); // Initialize `db` with the database connection
}

export const getDb = () => db;

// Checks if the username exists in the database
export async function checkUsername(username) {
    const userCount = await getDb().collection('Users').countDocuments({ username });
    return userCount > 0;
}
  
// Checks if the username and password match what is in the database
export async function checkPasswordMatch(username, password) {
    const user = await getDb().collection('Users').findOne({ username });
    return user.password === password;
}
  
// Inserts a username and password into the database
export async function insertUser(username, password) {
    return getDb().collection('Users').insertOne({ username, password });
}

// Removes a username and its associated password from the database
export async function deleteUser(username) {
    return getDb().collection('Users').deleteOne({ username });
}

export async function getAllUsernames() {
    const users = await getDb().collection('Users').find({}).toArray();
    const usernames = users.map(user => user.username);
    return usernames;
}

export async function createNewGame(players, gameName, startingCash, endDate) {
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

    // Create an array of player variable documents
    const playerVariableDocuments = players.map(username => ({
        username,
        Cash: startingCash,
        profits: 0,
        transactions: []
    }));

    // Insert player variable documents into the 'PlayerVariables' collection
    try {
        await db.collection('PlayerVariables').insertMany(playerVariableDocuments);
        console.log(`Player variables initialized for the game.`);
    } catch (error) {
        console.error(`Error initializing player variables: ${error}`);
        throw error;
    }

    return gameId;
}


