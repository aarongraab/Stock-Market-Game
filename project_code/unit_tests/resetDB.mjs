import * as db from '../database/index.mjs';

export async function clearDB() {
  try {
    // Ensure the database connection is established
    await db.connectToMongo();
    
    const collectionsToClear = ['GamePlayers', 'Games', 'PlayerVariables', 'Transactions', 'Users'];
  
    for (const collectionName of collectionsToClear) {
      await db.deleteDocumentsInCollection(collectionName);
    }

    console.log('All specified collections have been cleared.');
  } catch (error) {
    console.error(`An error occurred while clearing the database: ${error}`);
  }
  await db.closeConnection();
}

export async function initializeDB() {
    try {
      await db.connectToMongo();
      const database = db.getDb(); 
      var users = [
        { username: 'admin', password: 'admin', inGame: true },
        { username: 'aaron', password: 'aaron', inGame: false },
        { username: 'katelyn', password: '12345', inGame: false },
        { username: 'john', password: '12345', inGame: false },
        { username: 'timmy', password: '12345', inGame: false },
        { username: 'caleb', password: '12345', inGame: false },
      ];
      for (const user of users) {
        await database.collection('Users').insertOne({ ...user });
      }
      console.log('Admin and other users have been readded to the database.');
    } catch (error) {
        console.error('Error initializing the database:', error);
    } finally {
        await db.closeConnection(); 
    }
}

async function resetAndInitializeDB() {
    try {
        await clearDB(); // Wait for clearDB to finish
        console.log('Database cleared. Initializing...');
        await initializeDB(); // Initialize DB
        console.log('Database initialization complete.');
    } catch (error) {
        console.error('Error during reset and initialize:', error);
    }
}

resetAndInitializeDB();