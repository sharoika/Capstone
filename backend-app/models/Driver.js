const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const pricingDetailsSchema = new mongoose.Schema({
  initialPrice: { type: Number, required: true },
  perKmPrice: { type: Number, required: true }
});

const driverSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    homeLocation: { type: String },
    currentLocation: {
        lat: { type: Number, required: true, default: 0 },
        long: { type: Number, required: true, default: 0 }
    },
    
    pricingDetails: { type: pricingDetailsSchema, required: true },

    completedRides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }],

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

driverSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

driverSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Driver', driverSchema);