import mongoose from "mongoose";

const sensibullSchema = mongoose.Schema({
    success: {
        type: Boolean,
        required: true,
    },
    payload: {
        identifier: {
            type: String,
            required: true
        },
        symbol: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true
        },
        filled_quantity : {
            type: Number,
            required: false,
            default: 1,
        },
        order_status : {
            type: String,
            required: true,
        }
    }
});

export default mongoose.model('sensibull', sensibullSchema);