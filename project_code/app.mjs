import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import fetch from 'node-fetch';
import { format } from 'date-fns';

import * as db from './database/index.mjs';
import { LoginPageRoutes } from './routes/login_page_routes.mjs';
import { RegisterPageRoutes } from './routes/register_page_routes.mjs';
import { ProfilePageRoutes } from './routes/profile_page_routes.mjs';
import { BuyPageRoutes } from './routes/buy_page_routes.mjs';
import { SellPageRoutes } from './routes/sell_page_routes.mjs';
import { LogoutPageRoutes } from './routes/logout_page_routes.mjs';
import { AdminPageRoutes } from './routes/admin_page_routes.mjs';


const app = express();
const port = 8820;

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
      await db.connectToMongo();
      LoginPageRoutes(app);
      RegisterPageRoutes(app); 
      ProfilePageRoutes(app);
      BuyPageRoutes(app);
      SellPageRoutes(app);
      LogoutPageRoutes(app);
      AdminPageRoutes(app);
      app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
  } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1);
  }
}

start();

export default app;