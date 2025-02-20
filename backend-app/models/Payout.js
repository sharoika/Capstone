const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    driverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['AWAITING_PAYOUT', 'PAID'],
        default: 'AWAITING_PAYOUT'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    paidAt: {
        type: Date
    }
});

module.exports = mongoose.model('Payout', payoutSchema); 