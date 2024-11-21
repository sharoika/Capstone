const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed password
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
