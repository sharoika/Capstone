const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    driverID: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    currentLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // Longitude, Latitude
    },
    completedRides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }],
    licenseDoc: { type: String },
    abstractDoc: { type: String },
    criminalRecordCheckDoc: { type: String },
    vehicleMake: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    vehicleRegistrationDoc: { type: String },
    safetyInspectionDoc: { type: String },
    applicationApproved: { type: Boolean, default: false },
}, { collection: 'Drivers' }); // Explicitly set the collection name

DriverSchema.index({ currentLocation: '2dsphere' }); // For geospatial queries

module.exports = mongoose.model('Driver', DriverSchema);
