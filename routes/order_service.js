import express from "express";
import sensibull from "../models/sensibull.js";
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
// create data
router.post('/', async (req, res) => {
    const {symbol, quantity} = req.body;
    const identifier = generateIdentifier();
    const orderDetail = {
        identifier,
        symbol,
        quantity,
        order_status: 'open'
    }

    const order = new sensibull({
        success: true,
        payload: orderDetail
    })

    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).send({message: error.message})
    }
})
// update date
router.patch('/:id', getOrderById, async (req, res) => {
    const new_quantity = req.body.new_quantity;
    if (new_quantity !== null ) {
        res.order.payload.quantity = new_quantity;
    }

    try {
        const updatedOrder = await res.order.save();
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})
// delete data
router.delete('/:id', getOrderById, async (req, res) => {
    try {
        await res.order.deleteOne()
        res.json({ message: 'Order Cancel' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})
export default router;
// helper function to make an identifier
function generateIdentifier() {
    const timestamp = Date.now();
    return `ORDER-${timestamp}`;
}
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