import express from "express";
import mongoose from "mongoose";
// to get staff from env file
import dotenv from "dotenv";
dotenv.config()
// creating an express app
const app =  express();
// connectin to database
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.once('open', () => console.log("connected!"));
// allowing app to accepts json files/inputs
app.use(express.json())
// Middleware to handle X-AUTH-TOKEN header
app.use((req, res, next) => {
    const authToken = req.headers['x-auth-token'];
    if (!authToken || authToken.length < 12) {
        return res.status(401).json({ success: false, error: 'Invalid X-AUTH-TOKEN header' });
    }
    next();
});
// adding routs
import order_service from './routes/order_service.js';
app.use('/order_services', order_service);

app.listen(19093, () => console.log('Start'));
