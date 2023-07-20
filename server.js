import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import cron from 'node-cron';
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
app.use('/order-services', order_service);

// Background job
cron.schedule('*/15 * * * * *', async () => {
    // Get all orders
    const orders = Order.find();

    // Get identifier array
    const orderIds = orders.map((order) => order.identifier);

    if(orderIds.length === 0) return;

    // Fetch Updates
    const apiUrl = "https://prototype.sbulltech.com/api/order/status-for-ids";
    const authToken = 'asdfghjklzxc';

    try {
        const response = await axios.post(apiUrl, {
            order_ids: orderIds,
        }, {
            headers: {
                'X-AUTH-TOKEN': authToken,
            }
        },);

        // Extracting the updates
        const { payload: updatedOrders } =  response.data;

        for (const updatedOrder in updatedOrders) {
            const order = orders.find(order => order.identifier === updatedOrder.order_id);

            if (order) {
                order.order_status = updatedOrder.status;
                await order.save();
            }
        }

        console.log('Updated');
    } catch (err) {
        console.error('Order Status API error:', err.response?.data);
    }
})
app.listen(19093, () => console.log('Start'));
