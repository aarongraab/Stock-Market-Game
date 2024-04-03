import * as db from '../database/index.mjs';
import * as api from '../api.mjs';

const now = new Date();

export function LoginPageRoutes(app) {
    //---LOGIN PAGE ROUTES---
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
    const usernameExists = await db.checkUsername(username);
    if (usernameExists) {
        // If the username exists, proceed to check the password match
        if (await db.checkPasswordMatch(username, password)) {
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
    if (await db.checkPasswordMatch(username, password)) {
        res.status(200).json({ success: true });
        console.log("true");
    } else {
        res.status(401).json({ success: false });
        console.log("false");
    }
    });
}