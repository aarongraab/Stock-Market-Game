import { connectToMongo, closeConnection, getDb } from './connections.mjs';

import * as GamePlayers from './gamePlayers.mjs';
import * as Games from './games.mjs';
import * as PlayerVariables from './playerVariables.mjs';
import * as Transactions from './transactions.mjs';
import * as Users from './users.mjs';

// ***SET METHODS***
export async function addPlayerVariables(gameId, players, startingCash) {
    try {
        const numericStartingCash = parseInt(startingCash, 10);
        const initialProfits = 0; 

        const playerVariableDocuments = players.map(username => ({
            username,
            gameId,
            Cash: numericStartingCash, 
            profits: initialProfits, 
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



// ***GET METHODS***
export async function getCashValue(username) {
    const document = await getDb().collection('PlayerVariables').findOne({ username: username });
    return document ? document.Cash.toString() : "0"; 
}

export async function getProfits(username) { 
    const document = await getDb().collection('PlayerVariables').findOne({ username: username });
    return document ? document.profits.toString() : "0"; 
}

export async function checkBalance(username, totalCost) {
    try {
        const user = await getDb().collection('PlayerVariables').findOne({ username });
        if (!user) {
            console.error('Username not found:', username);
            return false; // User not found, treat as insufficient funds
        }
        return user.Cash >= totalCost; // Returns true if enough cash, otherwise false
    } catch (error) {
        console.error('Error checking balance for', username, error);
        throw error; 
    }
}

export async function getStocksOwned(username) {
    try {
        const player = await getDb().collection('PlayerVariables').findOne({ username: username });
        if (!player || !player.stocksOwned) {
            return [];
        }
        return player.stocksOwned;
    } catch (error) {
        console.error('Failed to get stocks owned:', error);
        throw error; 
    }
}

export async function checkQuantity(username, ticker, quantityToSell) {
    try {
        const userRecord = await getDb().collection('PlayerVariables').findOne({ username });

        if (!userRecord) {
            console.log("User not found.");
            return false; 
        }

        // Filter the stocksOwned array for the ticker and sum their quantities
        const totalQuantity = userRecord.stocksOwned
            .filter(stock => stock.stockTicker === ticker)
            .reduce((sum, stock) => sum + Number(stock.quantity), 0); 

        // Compare the total quantity of owned stock to the quantityToSell, ensuring quantityToSell is also treated as a number
        return totalQuantity >= Number(quantityToSell);
    } catch (error) {
        console.error("An error occurred:", error);
        throw error; 
    }
}




// ***MUTATOR METHODS***
export async function updatePlayerVariables(username, stockTicker, quantity, totalCost) {
    const roundedTotalCost = Math.round(totalCost * 100) / 100;
    
    // Subtract totalCost from user's Cash
    await getDb().collection('PlayerVariables').updateOne(
        { username },
        { 
            $inc: { Cash: -roundedTotalCost },
            $push: { 
                transactions: { stockTicker, quantity, totalCost },
                stocksOwned: { stockTicker, quantity }
            }
        }
    );
}

export async function combineStocks(username, stockTicker) {
    try {
        const userRecord = await getDb().collection('PlayerVariables').findOne({ username });

        if (!userRecord || !userRecord.stocksOwned) {
            console.log("User not found or no stocks owned.");
            return false; // User not found, or no stocks owned
        }
        // Filter the stocksOwned array for the ticker and sum their quantities
        const totalQuantity = userRecord.stocksOwned
            .filter(stock => stock.stockTicker === stockTicker)
            .reduce((sum, stock) => sum + Number(stock.quantity), 0);

        if (totalQuantity > 0) {
            // Remove all instances of the stock
            await getDb().collection('PlayerVariables').updateOne(
                { username },
                { $pull: { stocksOwned: { stockTicker } } }
            );
            // Add back a single instance with the combined quantity
            await getDb().collection('PlayerVariables').updateOne(
                { username },
                { $push: { stocksOwned: { stockTicker, quantity: totalQuantity } } }
            );
        }

        console.log(`Stocks combined for ${username}.`);
        return true;
    } catch (error) {
        console.error("An error occurred while combining stocks:", error);
        throw error; 
    }
}

export async function reduceQuantity(username, stockTicker, quantityToSell) {
    try {
        const userRecord = await getDb().collection('PlayerVariables').findOne({ username });

        if (!userRecord) {
            console.log("User not found.");
            return false; // User not found
        }
        // Check if the stock exists and has enough quantity
        let stockExists = false;
        userRecord.stocksOwned.forEach(stock => {
            if (stock.stockTicker === stockTicker) {
                stockExists = true;
                stock.quantity -= quantityToSell;
                // Optionally: Remove the stock or set quantity to 0 if it goes negative or zero
                if (stock.quantity <= 0) {
                    stock.quantity = 0; // Or handle removal
                    console.log(`Stock quantity dipped below zero ${stock.quantity}, => playerVariables.mjs - reduceQuantity error`)
                }
            }
        });
        if (!stockExists) {
            console.log(`Stock not found in ${username} portfolio.`);
            return false;
        }
        // Update the user's stocksOwned array back in the database
        await getDb().collection('PlayerVariables').updateOne(
            { username },
            { $set: { stocksOwned: userRecord.stocksOwned } }
        );

        console.log(`Stock quantity updated for ${username}.`);
        console.log(`User ${username} now has ${quantityToSell} less of ${stockTicker} stock.`)
        return true;
    } catch (error) {
        console.error("An error occurred while selling stock:", error);
        throw error; // Rethrow or handle as appropriate
    }
}

export async function removeZeroQuantityStocks(username) {
    try {
        const userRecord = await getDb().collection('PlayerVariables').findOne({ username });

        if (!userRecord || !userRecord.stocksOwned) {
            console.log("User not found or no stocks owned.");
            return false; // User not found, or no stocks owned
        }

        // Filter out any stock entries with a quantity of 0
        const filteredStocksOwned = userRecord.stocksOwned.filter(stock => stock.quantity > 0);

        // Update the user's stocksOwned array back in the database with the filtered list
        await getDb().collection('PlayerVariables').updateOne(
            { username },
            { $set: { stocksOwned: filteredStocksOwned } }
        );

        console.log(`Zero quantity stocks removed for ${username}.`);
        return true;
    } catch (error) {
        console.error("An error occurred while removing zero quantity stocks:", error);
        throw error; // Rethrow or handle as appropriate
    }
}

export async function updateProfits(username, totalCost) {
    try {
        // Update the profits for the user
        const updateResult = await getDb().collection('PlayerVariables').updateOne(
            { username: username },
            { $inc: { profits: totalCost } } 
        );

        if (updateResult.matchedCount === 0) {
            console.log("User not found.");
            return false; // User not found
        }

        if (updateResult.modifiedCount === 0) {
            console.log("Profits not updated.");
            return false; // Document found but not updated, possibly due to some other issue
        }

        console.log(`Profits updated for ${username}.`);
        return true;
    } catch (error) {
        console.error("An error occurred while updating profits:", error);
        throw error; // Rethrow or handle as appropriate
    }
}


//await connectToMongo();
//const test = await updateProfits('aaron', -2001);
//console.log(test);
//await closeConnection();