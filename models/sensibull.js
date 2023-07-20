import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    identifier: { 
        type: String, 
        required: true, 
        unique: true 
    },
    symbol: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    order_status: { 
        type: String, 
        required: true 
    },
});

export default mongoose.model('Order', orderSchema);