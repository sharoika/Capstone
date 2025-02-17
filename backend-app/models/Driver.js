const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    rate: { type: String, required: false },
    currentLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
    },
    completedRides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }],
    driverID: { type: String, unique: true, sparse: true },
    licenseDoc: { type: String },
    abstractDoc: { type: String },
    criminalRecordCheckDoc: { type: String },
    vehicleMake: { type: String, required: false },
    vehicleModel: { type: String, required: false },
    vehicleRegistrationDoc: { type: String },
    safetyInspectionDoc: { type: String },
    applicationApproved: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
}, { collection: 'Drivers' });

mongoose.connection.once('open', async () => {
    try {
        await mongoose.connection.collections.Drivers.dropIndex('driverID_1');
    } catch (err) {
    }
});

driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ driverID: 1 }, { sparse: true });

module.exports = mongoose.model('Driver', driverSchema);
