const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: false },
    location: {
        lat: { type: Number, required: true },
        long: { type: Number, required: true }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
