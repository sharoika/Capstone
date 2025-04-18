const mongoose = require('mongoose');
const RideStates = require('./enums/RideStates');
const UserTypes = require('./enums/UserTypes');

const RideSchema = new mongoose.Schema({
    riderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true },
    driverID: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: false },
    start: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    end: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    fare: { type: Number, required: false },
    distance: { type: Number, required: false },
    status: { type: String, enum: Object.values(RideStates), default: RideStates.PROPOSED },
    cancellationStatus: { type: String, enum: Object.values(UserTypes), default: 'none' },
    tipAmount: { type: Number, default: 0 },
    stripeTransactionId: { type: String, required: false },
    stripeTransactionTime: { type: Date, required: false },
});

module.exports = mongoose.model('Ride', RideSchema);
