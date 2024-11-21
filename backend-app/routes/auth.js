const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Token = require('../models/Token');
const { authenticate } = require('../middlewares/auth');
const router = express.Router();

router.get('/users', authenticate, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials U' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials P' });
    }

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log(token);
    req.session.token = token;
    res.json({ message: 'Login successful', token });
});


router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, phone, address } = req.body;
  
    try {
      // Hash the password for security
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user with the updated fields
      const newUser = new User({
        first_name,
        last_name,
        email,
        password: hashedPassword, // Store the hashed password
        phone,
        address
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'An error occurred while registering.');
    }
    
  });
module.exports = router;
