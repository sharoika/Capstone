const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Rider = require('../models/Rider');
const Driver = require('../models/Driver');
const Token = require('../models/Token');
const { authenticate } = require('../middlewares/auth');
const router = express.Router();

router.get('/users', authenticate, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.get('/drivers', authenticate, async (req, res) => {
    try {
        const drivers = await Driver.find(); // Fetch all drivers from the Drivers table
        res.json(drivers); // Send the drivers as a JSON response
    } catch (error) {
        console.error('Error fetching drivers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve or reject a driver
router.put('/drivers/:id/approval', authenticate, async (req, res) => {
    const { id } = req.params; // Driver ID from URL params
    const { approve } = req.body; // `approve` should be true or false

    try {
        // Find the driver by ID
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Update the approval status
        driver.applicationApproved = approve;
        await driver.save();

        res.json({ message: `Driver ${approve ? 'approved' : 'rejected'} successfully`, driver });
    } catch (error) {
        console.error('Error updating driver approval:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
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



// Rider Registration
router.post('/rider/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, homeLocation } = req.body;

  try {
      // Check if email already exists
      const existingRider = await Rider.findOne({ email });
      if (existingRider) {
          return res.status(400).json({ message: 'Email already in use' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new rider
      const newRider = new Rider({
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          homeLocation,
      });

      // Save the rider to the database
      await newRider.save();

      res.status(201).json({ message: 'Rider registered successfully' });
  } catch (error) {
      console.error('Error during rider registration:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});

// Rider Login
router.post('/rider/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Find rider by email
      const rider = await Rider.findOne({ email });
      if (!rider) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, rider.password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate a token
      const token = jwt.sign(
          { id: rider._id, email: rider.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
      );

      res.json({ message: 'Login successful', token });
  } catch (error) {
      console.error('Error during rider login:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});

// Driver Registration
router.post('/driver/register', async (req, res) => {
  const {
      firstName,
      lastName,
      email,
      phone,
      password,
      licenseDoc,
      vehicleMake,
      vehicleModel,
      vehicleRegistrationDoc,
      safetyInspectionDoc,
  } = req.body;

  try {
      // Check if email already exists
      const existingDriver = await Driver.findOne({ email });
      if (existingDriver) {
          return res.status(400).json({ message: 'Email already in use' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new driver
      const newDriver = new Driver({
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          licenseDoc,
          vehicleMake,
          vehicleModel,
          vehicleRegistrationDoc,
          safetyInspectionDoc,
      });

      // Save the driver to the database
      await newDriver.save();

      res.status(201).json({ message: 'Driver registered successfully' });
  } catch (error) {
      console.error('Error during driver registration:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});

// Driver Login
router.post('/driver/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Find driver by email
      const driver = await Driver.findOne({ email });
      if (!driver) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, driver.password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate a token
      const token = jwt.sign(
          { id: driver._id, email: driver.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
      );

      res.json({ message: 'Login successful', token });
  } catch (error) {
      console.error('Error during driver login:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
