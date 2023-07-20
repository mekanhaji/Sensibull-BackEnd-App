import express from "express";
import Order from "../models/sensibull.js";
import axios from "axios";

const router = express.Router();

// get all data
router.get('/', async (req, res) => {
    try {
        const orders = await sensibull.find();
        res.json(orders);
    } catch (err){
        res.status(500).send({message: err.message});
    }
})
// get one data
router.get('/status/:id', getOrderById, (req, res) => {
    res.send(res.order);
})

// create post order
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
            quantity:   order.request_quantity,
            order_status: order.status,
            order_tag: order.order_tag,
        });

        res.json({success: true, payload: savedOrder});
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
})
// update date
router.put('/:identifier', async (req, res) => {
    
})
// delete data
router.delete('/:id', getOrderById, async (req, res) => {
    
})
export default router;

// Middleware
async function getOrderById(req, res, next) {
    let order;
    try {
        order = await sensibull.findById(req.params.id);
        if (order == null) return res.status(404).json({ message: 'Cannot find order' })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.order = order
    next()
}