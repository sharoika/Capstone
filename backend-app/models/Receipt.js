const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
    rideID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        required: true
    },
    riderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rider',
        required: true
    },
    driverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    baseFare: {
        type: Number,
        required: true
    },
    distanceFare: {
        type: Number,
        required: true
    },
    tipAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'Credit Card'
    },
    distance: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,  // in minutes
        required: false
    },
    pickupLocation: {
        type: String,
        required: true
    },
    dropoffLocation: {
        type: String,
        required: true
    },
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

// Generate a unique receipt number before saving
ReceiptSchema.pre('save', async function (next) {
    if (!this.receiptNumber) {
        // Generate a receipt number format: FLEET-YYYYMMDD-XXXX (where XXXX is a random number)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number

        this.receiptNumber = `FLEET-${year}${month}${day}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Receipt', ReceiptSchema);
