const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    currentLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // Longitude, Latitude
    },
    completedRides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }],
    licenseDoc: { type: String },
    abstractDoc: { type: String },
    criminalRecordCheckDoc: { type: String },
    vehicleMake: { type: String, required: false },
    vehicleModel: { type: String, required: false },
    vehicleRegistrationDoc: { type: String },
    safetyInspectionDoc: { type: String },
    applicationApproved: { type: Boolean, default: false},
}, { collection: 'Drivers' }); // Explicitly set the collection name

DriverSchema.index({ currentLocation: '2dsphere' }); // For geospatial queries

module.exports = mongoose.model('Driver', DriverSchema);
