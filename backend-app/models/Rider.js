const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

RiderSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

RiderSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Rider', RiderSchema);