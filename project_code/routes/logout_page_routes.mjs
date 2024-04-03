import * as db from '../database/index.mjs';
import * as api from '../api.mjs';

const now = new Date();

export function LogoutPageRoutes(app) { 
    //--_LOGOUT PAGE---
    app.get('/logout', (req, res) => {
    return res.status(200).render('logout_page');
    });
}