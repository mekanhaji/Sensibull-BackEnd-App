import express from "express";
import Order from "../models/sensibull.js";
import axios from "axios";

const router = express.Router();

// create-post order
router.post('/', async (req, res) => {
    const {symbol, quantity} = req.body;
    const order_tag = 'yyyyy';
    // validate symbol and quantity
    if (!symbol || !quantity)
        return res.status(400).json({success: false, error: 'Symbol or Quantity Invalid'})

    // Place order on Sensibull's API
    const apiUrl = 'https://prototype.sbulltech.com/api/order/place';
    const authToken = req.headers['x-auth-token'];

    try {
        const response = await axios.post(apiUrl, {
            symbol,
            quantity,
            order_tag,
        }, {
            headers: {
                'X-AUTH-TOKEN': authToken,
            },
        });
        /*
        {
            "success": true,
            "payload": {
                "order": {
                    "order_id": "3896f5f8-2258-412e-b42f-71b9d1351121",
                    "order_tag": "yyyyyy",
                    "symbol": "HDFC",
                    "request_quantity": 200,
                    "filled_quantity": 0,
                    "status": "open"
                },
                "message": "order create success"
            }
            }
        */
        const { order, message } = response.data.payload;
        const savedOrder = await Order.create({
            identifier: order.order_id,
            symbol: order.symbol,
            quantity: order.request_quantity,
            order_status: order.status,
            order_tag: order.order_tag,
        });
        res.json({success: true, payload: savedOrder});
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
})

// update date
router.put('/', async (req, res) => {
    const { identifier, quantity } = req.body;
    // validation
    if (!identifier || !quantity) {
        return res.status(400).json({ success: false, error: 'Invalid identifier or quantity' });
    }

    // Find order in local DB
    const order = await Order.findOne({identifier})
    console.log(order);
    if(!order) {
        return res.status(404).json({ success: false, error: 'Order Not Found' });
    }

    // UPDATE on Sensibull's API
    const apiUrl = `https://prototype.sbulltech.com/api/order/${identifier}`;
    const authToken =  req.headers['x-auth-token'];

    try {
        const response = await axios.put(apiUrl, {
            quantity,
        }, {
            headers: {
                'X-AUTH-TOKEN': authToken,
            }
        });
        // Response from Sensibull's API
        const {updatedOrder, message} = response.data.payload;

        // Update Local DB
        order.quantity = updatedOrder.request_quantity;
        order.order_status = updatedOrder.status;
        await order.save();

        res.json({ success: true, payload: order})
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// delete Cancel Order
router.delete('/', async (req, res) => {
    const { identifier } = req.body;

    // Find order
    const order = order.findOne({ identifier: identifier });
    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'order not found'
        })
    };

    // UPDATE on Sensibull's API
    const apiUrl = `https://prototype.sbulltech.com/api/order/${identifier}`;
    const authToken =  req.headers['x-auth-token'];

    try {
        const response = await axios.put(apiUrl, {
            headers: {
                'X-AUTH-TOKEN': authToken,
            }
        });
        // Response from Sensibull's API
        const {order: cancelledOrder, message} = response.data.payload;

        order.order_status = cancelledOrder.status;
        await order.save();

        res.json({ success: true, payload: order})
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
})

// order status
router.post('/status', async (req, res) => {
    const { identifier } = req.body;

    // Find order
    const order = Order.findOne({ identifier: identifier });
    if (!order) {
        return res.status(404).json({ success: false, error: 'Order Not Found'});
    }
    console.log(order);

    res.json({ success: true, payload: order})
})


export default router;