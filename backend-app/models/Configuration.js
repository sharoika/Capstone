const mongoose = require('mongoose');

const ConfigurationSchema = new mongoose.Schema({
    maintenanceMode: { type: Boolean, default: false },
    locationFrequency: { type: Number, default: 5 }
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);
