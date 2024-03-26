import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import fetch from 'node-fetch';
import { format } from 'date-fns';

import * as database from './database.mjs';
import * as api from './api.mjs';

const app = express();
const port = 8820;
const now = new Date();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));

// Connect to MongoDB
async function start() {
    try {
        await database.connectToMongo();
        app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

//***ROUTES!***

//---LOGIN PAGE ROUTES---
//Default
app.get('/', (req, res) => {
  res.status(200).render('login_page'); 
});

//Login page
app.get('/login', (req, res) => {
  res.status(200).render('login_page'); 
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // First, check if the username exists
  const usernameExists = await database.checkUsername(username);
  if (usernameExists) {
    // If the username exists, proceed to check the password match
    if (await database.checkPasswordMatch(username, password)) {
      // If the password matches, log the user in
      res.status(200).json({ success: true, username: username });
      console.log("Login successful");
    } else {
      // If the password doesn't match, send an invalid credentials response
      res.status(401).json({ success: false, error: "Invalid credentials" });
      console.log("Login failed due to invalid credentials");
    }
  } else {
    // If the username doesn't exist, inform the user to register
    res.status(404).json({ success: false, error: "Username doesn't exist. Please register an account." });
    console.log("Login failed due to non-existent username");
  }
});

//Checks if username and password match whats in db
app.post('/check-match', async (req, res) => {
  const { username, password } = req.body;
  if (await database.checkPasswordMatch(username, password)) {
    res.status(200).json({ success: true });
    console.log("true");
  } else {
    res.status(401).json({ success: false });
    console.log("false");
  }
});

//---REGISTER PAGE ROUTES---
//Register page render
app.get('/register', (req, res) => {
  res.status(200).render('register_page'); 
});

//Register page - checks if username already exists in database
app.post('/check-username', async (req, res) => {
  const { username } = req.body;
  if (await database.checkUsername(username)) {
    console.log('Username exists in database:', username);
    res.status(200).json({ available: false });
  } else {
    res.status(200).json({ available: true });
  }
});

//Register page - inserts username and password into database
app.post('/insert', async (req, res) => {
  const { username, password } = req.body;

  if (await database.checkUsername(username)) {
    // Send a response indicating the username exists with status code 409 (Conflict)
    return res.status(409).json({ success: false, message: 'Username already exists' });
  }

  await database.insertUser(username, password);
  console.log('Username:', username, 'and Password:', password, 'was added to the database successfully');
  
  // After successful registration, send a response with status code 201 (Created)
  return res.status(201).json({ success: true, message: 'Registration successful' });
});


//---PROFILE PAGE---
//Profile page
// Dynamic route for user profiles
app.get('/profile/:username', (req, res) => {
  const { username } = req.params;
  res.status(200).render('profile_page', {
      username: username // Pass the username to your EJS template
  });
});


//---BUY PAGE---
app.get('/buy/:username', (req, res) => {
  const username = req.params.username;
  res.status(200).render('buy_page', { username }); 
});


//API Call for ticker price check
app.get('/api/check-price', async (req, res) => {
  const ticker = req.query.ticker;
  const now = new Date();
  const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  
  // Adjust for timezone offset to ensure correct date regardless of the local time zone
  const offset = yesterday.getTimezoneOffset() * 60000; // Convert offset to milliseconds
  const adjustedDate = new Date(yesterday.getTime() - offset);
  
  // Format as "YYYY-MM-DD"
  const formattedDate = adjustedDate.toISOString().split('T')[0];

  console.log(ticker);
  console.log(formattedDate);
  const stockPrice = await api.getStockPrice(ticker, formattedDate);
  console.log("Stock Price is:", stockPrice);

  if (stockPrice == null) {
      console.log("Overused API calls, try again in a minute. OR Trying to trade on a weekend or outside trading hours.");
      res.json({ success: false, error: 'Trading is not possible right now. Please try during trading hours.' });
      return;
  }

  try {
    // Assuming stockPrice is defined and has the value you want to send back
    if (stockPrice == null) {
        // Handle the case where stockPrice wasn't successfully retrieved
        throw new Error('Stock price is null');
    }

    // Send the stockPrice back to the client
    return res.status(200).json({ success: true, price: stockPrice });
} catch (error) {
    console.error('Failed to process stock price:', error);
    // Sending back a more generic error message to the client for any failure
    return res.status(500).json({ success: false, error: 'Failed to process stock price' });
}
});

//---SELL PAGE---
app.get('/sell/:username', (req, res) => {
  const username = req.params.username;
  // Optionally, fetch any necessary data using the username
  return res.status(200).render('sell_page', { username }); // Pass the username to your buy_page template
});

//--_LOGOUT PAGE---
app.get('/logout', (req, res) => {
  return res.status(200).render('logout_page');
});

//---ADMIN PAGE---
app.get('/admin', async (req, res) => {
  try {
    const users = await database.getAllUsernames();
    return res.status(200).render('admin_page', { userList: users });
  } catch (error) {
    console.error('Error retrieving user list:', error);
    return res.status(500).send('Internal Server Error');
  }
});


app.post('/admin', async (req, res) => {
  try {
    // Extracting the data sent from the form
    const { gameName, startingCash, endDate, players } = req.body;
    const gameId = await database.createNewGame(players, gameName, startingCash, endDate);
    console.log('Game', gameId, 'created successfully');

    // Respond to the client with a success message and status code 200
    return res.status(200).json({ success: true, message: 'Game created successfully', gameId });
  } catch (error) {
    // If an error occurs, log the error and respond with a status code of 500
    console.error('Error creating game:', error);
    return res.status(500).json({ success: false, error: 'Failed to create game' });
  }
});

start();

export default app;

