const mongoose = require('mongoose');

const pricingDetailsSchema = new mongoose.Schema({
  initialPrice: { type: Number, required: true },
  perKmPrice: { type: Number, required: true }
});

const PricingDetails = mongoose.model('PricingDetails', pricingDetailsSchema);

module.exports = { Contact, PricingDetails };