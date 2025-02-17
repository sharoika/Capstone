const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
    riderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    fare: { type: Number, required: true },
    rideBooked: { type: Boolean, default: false },
    driverSelected: { type: Boolean, default: false },
    rideInProgress: { type: Boolean, default: false },
    rideFinished: { type: Boolean, default: false },
    cancellationStatus: { type: String, enum: ['None', 'Rider', 'Driver'], default: 'None' },
    tipAmount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Ride', RideSchema);
