import { getDb } from './connections.mjs';

import * as GamePlayers from './gamePlayers.mjs';
import * as Games from './games.mjs';
import * as PlayerVariables from './playerVariables.mjs';
import * as Transactions from './transactions.mjs';
import * as Users from './users.mjs';

// ***SET METHODS***
// Inserts a username and password into the database and sets initial inGame boolean value to false
export async function insertUser(username, password) {
    const inGame = false;
    return getDb().collection('Users').insertOne({ username, password, inGame });
}



// ***GET METHODS***
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

export async function getAllUsernames() {
    const users = await getDb().collection('Users').find({}).toArray();
    const usernames = users.map(user => user.username);
    return usernames;
}

export async function getAllInGameFalseUsernames() {
    const users = await getDb().collection('Users').find({ inGame: false }).toArray();
    const usernames = users.map(user => user.username);
    return usernames;
}

export async function checkIfInGame(username) {
    // Attempt to find the user by username
    const user = await getDb().collection('Users').findOne({ username });

    // Check if the user exists and their inGame status
    if (user && user.inGame) {
        return true;
    } else {
        return false;
    }
}



// ***MUTATOR METHODS***
// Removes a username and its associated password from the database
export async function deleteUser(username) {
    return getDb().collection('Users').deleteOne({ username });
}

export async function changeInGame(username) {
    const updateResult = await getDb().collection('Users').updateOne(
        { username: username }, 
        { $set: { inGame: true } } 
    );
    // Check if the update was successful
    if (updateResult.modifiedCount === 1) {
        console.log('Successfully updated inGame status to true.');
    } else {
        console.log('Update failed or user does not exist.');
    }
}

