const mongoose = require('mongoose');

const RiderSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false},
  password: { type: String, required: true },
  homeLocation: { type: String },
  riderID: { type: String, required: false, unique: true },
  completedRides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }]
});

module.exports = mongoose.model('Rider', RiderSchema);