import * as db from '../database/index.mjs';
import * as api from '../api.mjs';

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
        { username: 'jeff', password: '12345', inGame: false },
        { username: 'bobby', password: '12345', inGame: false },
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

async function initializeGame() {
  try {
    await db.connectToMongo();
    var games = [
      { players: ['aaron', 'katelyn', 'caleb'], gameName: 'TestGame1', startingCash: 100000, endDate: '2024-04-20' },
      { players: ['john', 'timmy'], gameName: 'TestGame2', startingCash: 15000, endDate: '2024-04-20' },
    ];
    for (const game of games) {
      await db.createNewGame(game.players, game.gameName, game.startingCash, game.endDate);
    }    
    console.log('TestGame1 and TestGame2 successfully created and added to the database.');
  } catch (error) {
    console.error('Error initializing the database:', error);
  } finally {
    await db.closeConnection();
  }
}

async function initializeBuy() {
  try {
    await db.connectToMongo();

    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    // Adjust for timezone offset to ensure correct date regardless of the local time zone
    const offset = yesterday.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const adjustedDate = new Date(yesterday.getTime() - offset);
    // Format as "YYYY-MM-DD"
    const formattedDate = adjustedDate.toISOString().split('T')[0];

    const buy = 'BUY';
    const username = 'aaron';
    var stocks = [
      { ticker: 'AAPL', quantity: 10 },
      { ticker: 'HON', quantity: 115 },
      { ticker: 'JPM', quantity: 123 },
    ];
    for (const stock of stocks) {
      const stockPrice = await api.getStockPrice(stock.ticker, formattedDate);
      const totalCost = stockPrice * stock.quantity;
      await db.updatePlayerVariables(username, stock.ticker, stock.quantity, totalCost);
      await db.logTransaction(username, buy, stock.ticker, stock.quantity, totalCost);
      console.log(`Username: ${username} successfully purchased ${stock.quantity} stocks of ${stock.ticker}`);
    }
  } catch (error) {
    console.error('Error initializing stock purchase');
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
        await initializeGame();
        console.log('Game initialization complete.')
        await initializeBuy();
        console.log('Initialized stock purchases complete.')
    } catch (error) {
        console.error('Error during reset and initialize:', error);
    }
}

resetAndInitializeDB();