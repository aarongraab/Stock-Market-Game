import * as db from '../database/index.mjs';
import * as api from '../api.mjs';

const now = new Date();

export function RegisterPageRoutes(app) {    
    //Register page render
    app.get('/register', (req, res) => {
    res.status(200).render('register_page'); 
    });

    //Register page - checks if username already exists in database
    app.post('/check-username', async (req, res) => {
    const { username } = req.body;
    if (await db.checkUsername(username)) {
        console.log('Username exists in database:', username);
        res.status(200).json({ available: false });
    } else {
        res.status(200).json({ available: true });
    }
    });

    //Register page - inserts username and password into database
    app.post('/insert', async (req, res) => {
    const { username, password } = req.body;

    if (await db.checkUsername(username)) {
        // Send a response indicating the username exists with status code 409 (Conflict)
        return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    await db.insertUser(username, password);
    console.log('Username:', username, 'and Password:', password, 'was added to the database successfully. inGame variable set to false.');
    
    // After successful registration, send a response with status code 201 (Created)
    return res.status(201).json({ success: true, message: 'Registration successful' });
    });
}