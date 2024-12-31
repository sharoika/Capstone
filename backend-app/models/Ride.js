const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const RideSchema = new mongoose.Schema({
    rideID: { type: String, required: true, unique: true },
    riderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true },
    startLocation: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: true } // Longitude, Latitude
    },
    endLocation: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    distance: { type: Number }, // In kilometers
    duration: { type: Number }, // In minutes
    cancellationStatus: { type: String, enum: ['None', 'Rider', 'Driver'], default: 'None' },
    tipAmount: { type: Number, default: 0 },
    driverSelected: { type: Boolean, default: false },
    driverID: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    fare: { type: Number, required: true },
    rideBooked: { type: Boolean, default: false },
    rideInProgress: { type: Boolean, default: false },
    rideFinished: { type: Boolean, default: false },
    chatID: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
  });
  
  RideSchema.index({ startLocation: '2dsphere', endLocation: '2dsphere' }); // Geospatial index.
  
  module.exports = mongoose.model('Ride', RideSchema);
  