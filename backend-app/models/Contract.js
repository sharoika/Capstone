const mongoose = require('mongoose');
const ContractStates = require('./path/to/contract_states'); // Adjust the path as needed

const pricingDetailsSchema = new mongoose.Schema({
  initialPrice: { type: Number, required: true },
  perKmPrice: { type: Number, required: true }
});

const PricingDetails = mongoose.model('PricingDetails', pricingDetailsSchema);

const contactSchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startingLocation: {
    type: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true }
    },
    required: true
  },
  endingLocation: {
    type: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true }
    },
    required: true
  },
  lastKnownDriverLocation: {
    type: {
      lat: { type: Number },
      long: { type: Number }
    },
    default: null
  },
  lastKnownRiderLocation: {
    type: {
      lat: { type: Number },
      long: { type: Number }
    },
    default: null
  },
  pricingDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'PricingDetails', required: true },
  state: {
    type: String,
    enum: Object.values(ContractStates),
    default: ContractStates.PROPOSED
  },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = { Contact, PricingDetails };