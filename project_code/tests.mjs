//Here is where my code will be tested.

//Initial server set up
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import fetch from 'node-fetch';
import { format } from 'date-fns';
import request from 'supertest';
import app from './app.mjs';

import * as database from './database.mjs';
import * as api from './api.mjs';
jest.mock('./api.mjs'); 

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

//Initial database set up:
// Example user data
const testUsername = 'aaron';
const testPassword = 'password';

// Insert a user into the database before running any tests
beforeAll(async () => {
    await database.insertUser(testUsername, testPassword);
});

describe('POST /login', function() {
    beforeAll(async () => {
        // Insert a user for testing login functionality
        await database.insertUser('testUser', 'testPassword');
    });

    // Successful login attempt
    it('should successfully log in with correct credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testUser', password: 'testPassword' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ success: true, username: 'testUser' });
    });

    // Incorrect password
    it('should fail to log in with incorrect password', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testUser', password: 'wrongPassword' });
        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({ success: false, error: "Invalid credentials" });
    });

    // Non-existent username
    it('should fail to log in with a non-existent username', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'nonexistentUser', password: 'testPassword' });
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ success: false, error: "Username doesn't exist. Please register an account." });
    });

    afterAll(async () => {
        // await database.deleteUser('testUser');
    });
});

// Login Attempts
describe('POST /login', function() {
    // Define tests for various login scenarios
    var loginTests = [
        { args: {username: "aaron", password: "password"}, expected: 200, description: "correct credentials" },
        { args: {username: "aaron", password: "wrongpassword"}, expected: 401, description: "incorrect password" },
        { args: {username: "nonexistentuser", password: "password"}, expected: 404, description: "non-existent username" },
    ];

    loginTests.forEach(function(test) {
        it(`should return ${test.expected} for ${test.description}`, async () => {
            const response = await request(app)
                .post('/login')
                .send({ username: test.args.username, password: test.args.password });
            expect(response.statusCode).toBe(test.expected);
        });
    });
});

//Registration Attemps
describe('POST /register', function() {
    var tests = [
        // Assuming successful registration returns 201 Created
        { args: {username: "newUser1", password: "password123"}, expected: 201, description: "successful registration" },
        // Assuming attempting to register an existing user returns 409 Conflict
        { args: {username: "existingUser", password: "password123"}, expected: 409, description: "username already exists" },
        // Add more test cases as needed for your application logic
    ];

    tests.forEach(function(test) {
        it(`should return ${test.expected} for ${test.description}`, async () => {
            const response = await request(app)
                .post('/register')
                .send(test.args);
            expect(response.statusCode).toBe(test.expected);
        });
    });

    beforeEach(async () => {
        // Reset the database state
    });

    afterEach(async () => {
        // Clean up database
    });
});

//API Calls
describe('GET /api/check-price', () => {
    it('should return stock price successfully', async () => {
        // Mock api.getStockPrice to return a specific value
        api.getStockPrice.mockResolvedValue(100); // Mock the response as if the stock price is 100

        const ticker = 'AAPL'; // Example ticker
        const response = await request(app).get(`/api/check-price?ticker=${ticker}`);
        
        expect(api.getStockPrice).toHaveBeenCalledWith(ticker, expect.any(String)); // Check if the mocked function was called correctly
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, price: 100 });
    });

    it('should handle failure when stock price is not available', async () => {
        // Mock api.getStockPrice to return null to simulate failure
        api.getStockPrice.mockResolvedValue(null);

        const ticker = 'INVALID'; // Example ticker for a failure case
        const response = await request(app).get(`/api/check-price?ticker=${ticker}`);
        
        expect(response.status).toBe(500); // Adjust based on your error handling
        expect(response.body).toEqual({ success: false, error: 'Failed to process stock price' });
    });
});

start();
